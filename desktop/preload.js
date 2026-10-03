// Puente mínimo entre el juego y la app: logros de Steam, salir y pantalla completa
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("steam", {
  achieve: id => ipcRenderer.invoke("steam:achieve", id),
  quit: () => ipcRenderer.invoke("app:quit"),
  toggleFullscreen: () => ipcRenderer.invoke("app:fullscreen"),
});
