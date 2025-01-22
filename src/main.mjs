import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let authWindow = null;

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8181";

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

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' http://localhost:* ws://localhost:*; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "connect-src 'self' http://localhost:* ws://localhost:*;",
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
  }

  // F12 단축키 등록
  globalShortcut.register("F12", () => {
    mainWindow.webContents.toggleDevTools();
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

  // 윈도우 생성 후 네비게이션 제어
  mainWindow.webContents.on("will-navigate", (event, url) => {
    // 개발 환경에서는 localhost:3000 허용
    if (isDev && url.startsWith("http://localhost:3000")) {
      return;
    }

    // 프로덕션 환경에서는 로컬 파일만 허용
    if (!url.startsWith("file://")) {
      event.preventDefault();
    }
  });
}

// OAuth 로그인 처리
ipcMain.handle("oauth:login", async (event, provider) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user-service/api/v1/users/o-auth`,
      { params: { provider } }
    );

    if (response.data) {
      // OAuth 창 생성
      authWindow = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // OAuth URL로 이동
      authWindow.loadURL(response.data);

      // URL 변경 감지
      authWindow.webContents.on("did-navigate", async (event, url) => {
        if (url.startsWith("http://localhost:3000/oauth")) {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get("code");

          if (code) {
            try {
              // 토큰 요청
              const tokenResponse = await axios.post(
                `${API_BASE_URL}/user-service/api/v1/users/callback`,
                { code, provider },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              // 메인 윈도우로 결과 전송
              mainWindow.webContents.send("oauth:callback", tokenResponse.data);

              // OAuth 창 닫기
              authWindow.close();
              authWindow = null;
            } catch (error) {
              console.error("Token request failed:", error);
              mainWindow.webContents.send("oauth:callback", {
                error: error.message,
              });
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("OAuth request failed:", error);
    return { error: error.message };
  }
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
