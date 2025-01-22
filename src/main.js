const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const axios = require("axios");

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

  // 개발/프로덕션 환경에 따라 다른 URL 로드
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    // 개발자 도구 열기
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
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
  ipcMain.handle("window:logout", async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user-service/api/v1/users/sign-out`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        }
      );
      console.log("로그아웃 성공:", response.data);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      // Access Token 삭제
      localStorage.removeItem("ACCESS_TOKEN");
    }
  });
}

// OAuth 로그인 처리
ipcMain.handle("oauth:login", async (event, provider) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user-service/api/v1/users/o-auth`,
      {
        params: { provider },
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
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
              // 토큰 요청 - GET 메서드로 변경
              const tokenResponse = await axios.post(
                `${API_BASE_URL}/user-service/api/v1/users/callback`,
                { code },
                {
                  params: {
                    code,
                    provider,
                    redirect_uri: "http://localhost:3000/oauth/callback",
                  },
                  withCredentials: true,
                  headers: {
                    Accept: "application/json",
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
              if (error.response) {
                console.error("Error response:", error.response.data);
              }
              mainWindow.webContents.send("oauth:callback", {
                error: error.response?.data?.message || error.message,
              });
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("OAuth request failed:", error);
    return { error: error.response?.data?.message || error.message };
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

// IPC 핸들러
