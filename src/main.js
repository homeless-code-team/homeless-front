const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
let mainWindow = null;
let authWindow = null;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 개발 환경인지 확인
const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
      additionalArguments: [`--js-flags=--max-old-space-size=4096`],
    },
  });

  // 개발/프로덕션 환경에 따라 다른 URL 로드
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://homelesscode.shop");
    // 개발자 도구 열기
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("http://homelesscode.shop");
    //mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  }

  // 윈도우가 닫히기 전에 이벤트 발생
  mainWindow.on("close", (e) => {
    if (mainWindow) {
      e.preventDefault();
      mainWindow.webContents.send("window:before-close");
      setTimeout(() => {
        mainWindow.destroy();
      }, 100);
    }
  });

  // 윈도우가 닫힐 때 단축키 해제
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (globalShortcut.isRegistered("F12")) {
      globalShortcut.unregister("F12");
    }
  });

  // IPC 핸들러
  ipcMain.handle("window:close", () => {
    mainWindow.close();
    return true;
  });

  ipcMain.handle("window:minimize", () => {
    mainWindow.minimize();
    return true;
  });

  ipcMain.handle("window:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return false;
    } else {
      mainWindow.maximize();
      return true;
    }
  });

  ipcMain.handle("window:isMaximized", () => {
    return mainWindow.isMaximized();
  });

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC 핸들러
ipcMain.on("window:close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close(); // 현재 창을 닫습니다.
  }
});
