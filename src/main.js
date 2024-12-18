import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(process.cwd(), "src", "preload.cjs"),
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  // F12 단축키 등록
  globalShortcut.register("F12", () => {
    mainWindow.webContents.toggleDevTools();
  });

  // 윈도우가 닫힐 때 단축키 해제
  mainWindow.on("closed", () => {
    globalShortcut.unregister("F12");
  });

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
