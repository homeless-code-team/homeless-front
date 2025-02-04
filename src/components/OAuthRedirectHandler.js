import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AuthContext from "../context/AuthContext.js";
import axiosInstance from "../configs/axios-config.js";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8181";

const OAuthRedirectHandler = () => {
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      console.log("OAuth Redirect Handler Mounted");
      console.log("Current URL:", window.location.href);
      console.log("Path:", window.location.pathname);
      console.log("Search:", window.location.search);

      const code = new URLSearchParams(window.location.search).get("code");
      const provider = new URLSearchParams(window.location.search).get(
        "provider"
      ); // provider 추가
      console.log("Received code:", code);
      console.log("Provider:", provider); // provider 로그 추가

      if (code) {
        try {
          const tokenResponse = await axiosInstance.post(
            `${API_BASE_URL}/user-service/api/v1/users/callback`, // API 엔드포인트
            { code, provider }, // provider를 동적으로 전달
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          console.log("Token Response:", tokenResponse);

          if (tokenResponse.data.status === "OK") {
            const token = tokenResponse.data.data;
            const decoded = jwtDecode(token);

            const userInfo = {
              token,
              email: decoded.sub,
              userId: decoded.user_id,
              role: decoded.role,
              nickname: decoded.nickname,
            };

            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            localStorage.setItem("token", token); // token도 따로 저장

            // AuthContext의 onLogin 호출
            onLogin(token, userInfo.email, userInfo.role, userInfo.nickname);

            // navigate 사용
            navigate("/", { replace: true });
          } else {
            throw new Error("Token response was not OK");
          }
        } catch (error) {
          console.error("OAuth 콜백 처리 실패:", error);
          console.error("Error details:", error.response || error);
          alert("로그인 처리 중 오류가 발생했습니다.");
          navigate("/", { replace: true });
        }
      } else {
        console.log("No code found");
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, onLogin]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div>OAuth 인증 처리중...</div>
    </div>
  );
};

export default OAuthRedirectHandler;
