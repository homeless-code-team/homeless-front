import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("WindowControls", {
  closeWindow: () => ipcRenderer.invoke("window:close"),
});
