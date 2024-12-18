import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

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
  mainWindow.webContents.openDevTools();

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
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
