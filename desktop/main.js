// Marea Humana: app de escritorio para Steam (Electron + steamworks.js)
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");

// App ID de Steam. 480 es "Spacewar", la app de prueba de Valve: sirve para probar logros y la
// superposición antes de tener una página propia. Cámbialo por el App ID que te dé Steamworks.
const STEAM_APP_ID = 480;

let steam = null;
let steamworks = null;
try {
  steamworks = require("steamworks.js");
  // Si alguien abre el .exe fuera de Steam, Steam relanza el juego desde el cliente.
  if (app.isPackaged && STEAM_APP_ID !== 480 && steamworks.restartAppIfNecessary(STEAM_APP_ID)) app.exit(0);
  steam = steamworks.init(STEAM_APP_ID);
} catch (err) {
  console.log("Steam no está disponible; el juego corre sin logros.", err.message);
}

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 720, minHeight: 600,
    backgroundColor: "#141516", title: "Marea Humana", autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  win.once("ready-to-show", () => win.show());
  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11" || (input.alt && input.key === "Enter")) { win.setFullScreen(!win.isFullScreen()); event.preventDefault(); }
  });
  // el juego no navega a ningún sitio externo
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

// La superposición de Steam (Mayús+Tab) necesita esto al final de main.js
if (steam && steamworks) steamworks.electronEnableSteamOverlay();
