// src/components/OAuthCallback.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      navigate("/");
    } else {
      navigate("/sign-in");
    }
  }, [navigate]);

  return <div>로그인 중...</div>;
};

export default OAuthCallback;
