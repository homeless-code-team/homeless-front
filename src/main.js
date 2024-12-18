import { app, BrowserWindow, Menu, nativeTheme, ipcMain } from "electron";
import path from "path";

const __dirname = path.resolve();
let win;

function createWindow() {
  nativeTheme.themeSource = "dark";

  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    title: "Homeless Code",
    frame: false,
    backgroundColor: "#1e1f22",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:3000");
  Menu.setApplicationMenu(null);

  ipcMain.on("minimize-window", () => {
    win.minimize();
  });

  ipcMain.on("maximize-window", () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on("close-window", () => {
    win.close();
  });
}

if (process.platform === "darwin") {
  app.dock.setIcon(path.join(__dirname, "icon.png"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
