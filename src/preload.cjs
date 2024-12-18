const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("windowControls", {
  closeWindow: () => ipcRenderer.invoke("window:close"),
});
