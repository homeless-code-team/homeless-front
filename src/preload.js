const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  navigate: (callback) => {
    ipcRenderer.on("navigate", (event, path) => {
      callback(path);
    });
  },
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  close: () => ipcRenderer.send("close-window"),
});
