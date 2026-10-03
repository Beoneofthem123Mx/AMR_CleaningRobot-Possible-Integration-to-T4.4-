// Human Tide: desktop app for Steam (Electron + steamworks.js)
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");

// Steam App ID. 480 is "Spacewar", Valve's test app: it lets you test achievements and the
// overlay before you have your own store page. Replace it with the App ID Steamworks gives you.
const STEAM_APP_ID = 480;

let steam = null;
let steamworks = null;
try {
  steamworks = require("steamworks.js");
  // If someone opens the .exe outside Steam, Steam relaunches the game from the client.
  if (app.isPackaged && STEAM_APP_ID !== 480 && steamworks.restartAppIfNecessary(STEAM_APP_ID)) app.exit(0);
  steam = steamworks.init(STEAM_APP_ID);
} catch (err) {
  console.log("Steam is not available; the game runs without achievements.", err.message);
}

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 720, minHeight: 600,
    backgroundColor: "#141516", title: "Human Tide", autoHideMenuBar: true, show: false, icon: path.join(__dirname, "..", "game", "icon.png"),
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.once("ready-to-show", () => win.show());
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11" || (input.alt && input.key === "Enter")) { win.setFullScreen(!win.isFullScreen()); event.preventDefault(); }
  });
  // the game never navigates to any external site
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", e => e.preventDefault());
  win.loadFile(path.join(__dirname, "..", "game", "index.html"));
}

ipcMain.handle("steam:achieve", (_e, id) => {
  if (!steam || typeof id !== "string") return false;
  try { return steam.achievement.activate(id); } catch (err) { return false; }
});
ipcMain.handle("app:quit", () => app.quit());
ipcMain.handle("app:fullscreen", () => { if (win) win.setFullScreen(!win.isFullScreen()); });

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());

// The Steam overlay (Shift+Tab) needs this at the end of main.js
if (steam && steamworks) steamworks.electronEnableSteamOverlay();
