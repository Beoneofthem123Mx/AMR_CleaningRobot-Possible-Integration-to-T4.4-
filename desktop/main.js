// Human Tsunami: desktop app for Steam (Electron + steamworks.js)
const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

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
    backgroundColor: "#141516", title: "Human Tsunami", autoHideMenuBar: true, show: false, icon: path.join(__dirname, "..", "game", "icon.png"),
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
// Steam Workshop: a custom venue is published as one small text file (its share code) plus a preview
ipcMain.handle("ws:publish", async (_e, p) => {
  if (!steam) return { ok: false, error: "Steam is not running." };
  try {
    if (!p || typeof p.code !== "string" || !p.code.startsWith("HT1:") || p.code.length > 200000) return { ok: false, error: "That venue could not be read." };
    const root = path.join(app.getPath("userData"), "workshop"), dir = path.join(root, "item_" + Date.now());
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "venue.ht"), p.code);
    let previewPath;
    if (typeof p.preview === "string" && p.preview.startsWith("data:image/jpeg;base64,") && p.preview.length < 1.5e6) { previewPath = dir + "_preview.jpg"; fs.writeFileSync(previewPath, Buffer.from(p.preview.split(",")[1], "base64")); }
    const created = p.itemId ? { itemId: BigInt(p.itemId), needsToAcceptAgreement: false } : await steam.workshop.createItem();
    const res = await steam.workshop.updateItem(created.itemId, { title: String(p.title || "Custom venue").slice(0, 120), description: String(p.desc || "").slice(0, 4000), contentPath: dir, previewPath, tags: ["Venue"], visibility: 0, changeNote: p.itemId ? "Updated venue" : "First version" });
    const agreement = !!(res.needsToAcceptAgreement || created.needsToAcceptAgreement);
    try { steam.overlay.activateToWebPage(agreement ? "https://steamcommunity.com/sharedfiles/workshoplegalagreement" : "steam://url/CommunityFilePage/" + String(res.itemId)); } catch (err) { /* no overlay */ }
    return { ok: true, id: String(res.itemId), agreement };
  } catch (err) { return { ok: false, error: String((err && err.message) || err) }; }
});
// subscribed venues, already downloaded by Steam: read each one's share code
ipcMain.handle("ws:list", () => {
  if (!steam) return [];
  try {
    return steam.workshop.getSubscribedItems().map(id => {
      const info = steam.workshop.installInfo(id); if (!info) return null;
      try { return { id: String(id), code: fs.readFileSync(path.join(info.folder, "venue.ht"), "utf8").slice(0, 200000) }; } catch (err) { return null; }
    }).filter(Boolean);
  } catch (err) { return []; }
});
ipcMain.handle("ws:browse", () => { if (!steam) return false; try { steam.overlay.activateToWebPage("steam://url/SteamWorkshopPage/" + STEAM_APP_ID); return true; } catch (err) { return false; } });
ipcMain.handle("app:quit", () => app.quit());
ipcMain.handle("app:fullscreen", () => { if (win) win.setFullScreen(!win.isFullScreen()); });

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());

// The Steam overlay (Shift+Tab) needs this at the end of main.js
if (steam && steamworks) steamworks.electronEnableSteamOverlay();
