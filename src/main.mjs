import {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  protocol,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// 개발 환경인지 확인
const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      additionalArguments: [`--js-flags=--max-old-space-size=4096`],
    },
  });

  protocol.registerFileProtocol("static", (request, callback) => {
    const url = request.url.replace("static://", "");
    const filePath = path.join(__dirname, "public", url);
    callback({ path: filePath });
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' http://localhost:* ws://localhost:* ws: wss: http: https:; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "connect-src 'self' http://localhost:* ws://localhost:* ws: wss: http: https:;",
          ],
        },
      });
    }
  );

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
    mainWindow.webContents.openDevTools();
  }

  // F12 단축키 등록
  globalShortcut.register("F12", () => {
    mainWindow.webContents.toggleDevTools();
  });

  // 윈도우가 닫힐 때 단축키 해제
  mainWindow.on("closed", () => {
    globalShortcut.unregister("F12");
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
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  globalShortcut.unregisterAll(); // 모든 단축키 해제
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
