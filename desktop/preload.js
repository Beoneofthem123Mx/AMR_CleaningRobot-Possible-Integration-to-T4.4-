// Minimal bridge between the game and the app: Steam achievements, quit and fullscreen
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("steam", {
  achieve: id => ipcRenderer.invoke("steam:achieve", id),
  quit: () => ipcRenderer.invoke("app:quit"),
  toggleFullscreen: () => ipcRenderer.invoke("app:fullscreen"),
});
