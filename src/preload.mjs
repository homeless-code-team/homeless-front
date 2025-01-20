import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  handleOAuth: (provider) => ipcRenderer.invoke("oauth:login", provider),
  onOAuthCallback: (callback) =>
    ipcRenderer.on("oauth:callback", (event, data) => callback(data)),
});
