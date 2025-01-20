import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OAuthRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Electron 환경에서 쿼리 파라미터를 처리
      const currentUrl = window.location.href; // 현재 URL 가져오기
      const urlParams = new URLSearchParams(currentUrl.split("?")[1]); // 쿼리 파라미터 분리
      const code = urlParams.get("code"); // 인증 코드 추출
      const provider = urlParams.get("provider"); // provider 정보 추출 (google, github 등)

      console.log("Current URL:", currentUrl);
      console.log("Extracted Params:", urlParams);
      console.log("OAuth Code:", code);
      console.log("Provider:", provider);

      if (!code || !provider) {
        alert(
          "OAuth 인증 코드 또는 제공자 정보가 제공되지 않았습니다. 다시 시도해주세요."
        );
        navigate("/sign-in");
        return;
      }

      try {
        // 백엔드로 인증 코드 및 제공자 정보 전달
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/callback`,
          { code, provider }
        );

        if (response.data && response.data.accessToken) {
          const userInfo = response.data;

          // 사용자 정보 로컬 스토리지에 저장
          localStorage.setItem("accessToken", userInfo.accessToken);
          localStorage.setItem("refreshToken", userInfo.refreshToken);
          localStorage.setItem("user", JSON.stringify(userInfo.user));

          // 로그인 성공 후 메인 페이지로 리디렉트
          navigate("/");
        } else {
          alert("OAuth 처리 중 문제가 발생했습니다.");
        }
      } catch (error) {
        console.error(`[${provider}] OAuth 처리 오류:`, error);
        alert(
          `${provider} 로그인 처리 중 문제가 발생했습니다. 관리자에게 문의하세요.`
        );
        navigate("/sign-in");
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return <div>로그인 처리 중입니다...</div>;
};

export default OAuthRedirectHandler;
