// Minimal bridge between the game and the app: Steam achievements, the Workshop, quit and fullscreen
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("steam", {
  achieve: id => ipcRenderer.invoke("steam:achieve", id),
  quit: () => ipcRenderer.invoke("app:quit"),
  workshop: {
    publish: item => ipcRenderer.invoke("ws:publish", item),
    list: () => ipcRenderer.invoke("ws:list"),
    browse: () => ipcRenderer.invoke("ws:browse"),
  },
  toggleFullscreen: () => ipcRenderer.invoke("app:fullscreen"),
});
