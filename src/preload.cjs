const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("WindowControls", {
  closeWindow: () => ipcRenderer.invoke("window:close"),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
});
