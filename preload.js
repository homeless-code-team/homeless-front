const { contextBridge, ipcRenderer } = require("electron");

// 이벤트 리스너를 저장할 변수
let closeCallback = null;

// 이벤트 리스너 설정
ipcRenderer.on("window:before-close", () => {
  if (closeCallback) closeCallback();
});

contextBridge.exposeInMainWorld("WindowControls", {
  closeWindow: () => ipcRenderer.invoke("window:close"),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
  isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
  onBeforeClose: (callback) => {
    closeCallback = callback;
  },
  getWindowSize: () => ipcRenderer.invoke("window:getSize"),
  onWindowResize: (callback) => ipcRenderer.on("window:resize", callback),
});
contextBridge.exposeInMainWorld("electronAPI", {
  logout: () => ipcRenderer.invoke("window:logout"),
  handleOAuth: (provider) => ipcRenderer.invoke("oauth:login", provider),
  onOAuthCallback: (callback) =>
    ipcRenderer.on("oauth:callback", (event, data) => callback(data)),
});
