// src/utils/oauthLogin.js
function isElectron() {
    return navigator.userAgent.toLowerCase().includes("electron");
  }
  
  export async function oauthLogin(provider) {
    if (isElectron()) {
      const { ipcRenderer } = window.require("electron");
      return ipcRenderer.invoke("oauth-login", provider);
    } else {
      return new Promise((resolve, reject) => {
        const authUrl = `https://homelesscode.shop/user-service/oauth2/authorize/${provider}`;
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        const authWindow = window.open(
          authUrl,
          `${provider} Login`,
          `width=${width},height=${height},top=${top},left=${left}`
        );
  
        const messageHandler = (event) => {
          if (event.origin !== "https://homelesscode.shop") return;
          if (event.data && event.data.accessToken) {
            resolve(event.data.accessToken);
            window.removeEventListener("message", messageHandler);
            authWindow.close();
          }
        };
  
        window.addEventListener("message", messageHandler, false);
      });
    }
  }
  
