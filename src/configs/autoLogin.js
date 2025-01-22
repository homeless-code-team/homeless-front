import axiosInstance from "./axios-config.js";

async function autoLogin() {
  const accessToken = localStorage.getItem("ACCESS_TOKEN");

  try {
    if (accessToken) {
      // Access Token 유효성 확인
      const response = await axiosInstance.post(
        `/user-service/api/v1/users/access-token/validate`,
        { token: accessToken }
      );

      if (response.data.valid) {
        console.log("Access Token 유효함, 자동 로그인 성공!");
        return true; // 유효한 토큰
      }
    }

    // Access Token이 없거나 만료된 경우, Refresh Token 사용
    const refreshTokenResponse = await axiosInstance.post(
      `/user-service/api/v1/users/refresh-token`
    );

    const newAccessToken = refreshTokenResponse.data.result.token;
    localStorage.setItem("ACCESS_TOKEN", newAccessToken); // 새 토큰 저장
    axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`; // Axios 인스턴스 업데이트
    console.log("새로운 Access Token 발급 완료, 자동 로그인 성공!");
    return true;
  } catch (error) {
    console.error("자동 로그인 실패:", error);
    localStorage.removeItem("ACCESS_TOKEN");
    return false; // 자동 로그인 실패
  }
}

export default autoLogin;
