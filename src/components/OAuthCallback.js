import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../configs/axios-config";

const API_BASE_URL = "http://localhost:8181";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // 전체 URL 로깅
      console.log("Current URL:", window.location.href);
      console.log("Path:", window.location.pathname);
      console.log("Search:", window.location.search);

      const code = new URLSearchParams(window.location.search).get("code");
      console.log("Received code:", code);

      if (code) {
        try {
          const tokenResponse = await axiosInstance.post(
            `${API_BASE_URL}/user-service/api/v1/users/callback`,
            { code }
          );

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
            // 로그인 성공 후 메인 페이지로 리다이렉트
            window.location.href = "/";
          }
        } catch (error) {
          console.error("OAuth 콜백 처리 실패:", error);
          console.error("Error details:", error.response || error);
          alert("로그인 처리 중 오류가 발생했습니다.");
          navigate("/");
        }
      } else {
        console.log("No code found");
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>OAuth 인증 처리중...</div>;
};

export default OAuthCallback;
