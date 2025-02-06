import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

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
      preload: isDev 
        ? path.join(__dirname, "preload.js")
        : path.join(process.resourcesPath, "preload.js"),
      webSecurity: true,
      additionalArguments: [`--js-flags=--max-old-space-size=4096`],
    },
  });

  // 개발/프로덕션 환경에 따라 다른 URL 로드
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    // 개발자 도구 열기
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("https://homelesscode.shop"); 
    
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

  // IPC 핸들러
  ipcMain.on("window:close", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.close(); // 현재 창을 닫습니다.
    }
  });

  // OAuth 로그인 요청 처리
  ipcMain.handle("oauth-login", async (event, provider) => {
    return new Promise((resolve, reject) => {
      let authWindow = new BrowserWindow({
        width: 600,
        height: 700,
        show: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      const authUrl = `https://homelesscode.shop/user-service/oauth2/authorize/${provider}`;
      authWindow.loadURL(authUrl);

      // OAuth 리다이렉트 후 accessToken 전달받기
      authWindow.webContents.on("did-navigate", (event, url) => {
        try {
          const params = new URL(url).searchParams;
          const accessToken = params.get("accessToken");
          if (accessToken) {
            resolve(accessToken);
            authWindow.close();
          }
        } catch (error) {}
      });

      authWindow.on("closed", () => {
        reject(new Error("OAuth 창이 닫혔습니다."));
      });
    });
  });

  // 윈도우 크기 변경 이벤트 처리 수정
  mainWindow.on('resize', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      mainWindow.webContents.send('window:resize', { width, height });
      // 디버깅용 로그
      console.log('Window resized:', { width, height });
    }
  });

  // 윈도우 크기 조회 핸들러 수정
  ipcMain.handle('window:getSize', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      console.log('Current window size:', { width, height });
      return [width, height];
    }
    return [1200, 800]; // 기본값
  });
}

// createWindow 함수를 앱이 준비되었을 때 실행
app.whenReady().then(createWindow).catch(error => {
  console.error('앱 시작 오류:', error);
});

// 에러 핸들링 추가
process.on('uncaughtException', (error) => {
  console.error('처리되지 않은 예외:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('처리되지 않은 프로미스 거부:', error);
});

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