// 윈도우가 닫히기 전에 이벤트 발생
mainWindow.on("close", (e) => {
  e.preventDefault();
  mainWindow.webContents.send("window:before-close");
  setTimeout(() => {
    mainWindow.destroy();
  }, 100);
});

// 윈도우가 닫힐 때 단축키 해제
mainWindow.on("closed", () => {
  globalShortcut.unregister("F12");
});

// IPC 핸들러
