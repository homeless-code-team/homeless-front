import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./SignIn.css";
import googleImage from "../asset/google.png";
import githubImage from "../asset/github.png";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8181";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  // 일반 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/user-service/api/v1/users/sign-in`,
        { email, password }
      );

      if (res.data.status === "OK") {
        const token = res.data.data;
        const decoded = jwtDecode(token);

        const userInfo = {
          token,
          email: decoded.sub,
          userId: decoded.user_id,
          role: decoded.role,
          nickname: decoded.nickname,
        };

        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        localStorage.setItem("token", token);
        onLogin(
          token,
          userInfo.email,
          userInfo.userId,
          userInfo.role,
          userInfo.nickname
        );
        navigate("/");
      } else {
        setLoginError(res.data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth 로그인 처리
  const oauthLogin = async (provider) => {
    console.log(`OAuth 로그인 시도 - 제공자: ${provider}`);
    console.log("window.electron:", window.electron);
    console.log("window.electronAPI:", window.electronAPI);

    if (!window.electron) {
      // window.electronAPI 대신 window.electron으로 수정
      // 웹 환경 처리
      try {
        const redirectUrl = `${API_BASE_URL}/user-service/oauth2/authorization/${provider}`;
        console.log(`리다이렉트 URL: ${redirectUrl}`);

        // 리다이렉트 전에 현재 URL을 state로 저장
        sessionStorage.setItem("oauth2_state", window.location.href);

        window.location.href = redirectUrl;
      } catch (error) {
        console.error("OAuth 로그인 요청 실패:", error);
        setLoginError(`OAuth 로그인 실패: ${error.message}`);
      }
    } else {
      // Electron 환경 처리
      try {
        setIsLoading(true);
        console.log(`Electron OAuth 처리 시작 - 제공자: ${provider}`);

        const result = await window.electron.ipcRenderer.invoke(
          "oauth-login",
          provider
        ); // electronAPI 대신 electron 사용
        console.log("OAuth 결과:", result);

        if (result?.token) {
          console.log("토큰 수신 성공");
          await handleTokenAndUserInfo(result.token);
          navigate("/dashboard");
        } else {
          console.error("토큰이 없는 응답:", result);
          setLoginError("인증에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        console.error("Electron OAuth 처리 실패:", error);
        setLoginError(`OAuth 처리 중 오류: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // JWT 토큰 처리 함수
  const handleTokenAndUserInfo = async (token) => {
    try {
      const decoded = jwtDecode(token);

      // 사용자 정보 추출
      const userInfo = {
        token,
        email: decoded.sub,
        userId: decoded.user_id,
        role: decoded.role,
        nickname: decoded.nickname,
      };

      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("token", token);

      // 상태 업데이트 및 페이지 이동
      onLogin(token, userInfo.email, userInfo.role, userInfo.nickname);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("JWT 디코딩 실패:", error);
      setLoginError("로그인 데이터 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <div className="signin-header">
          <h2>Welcome back!</h2>
          <p>Homeless Code에서 다시 만나 반가워요</p>
        </div>
        <form onSubmit={handleLogin} className="signin-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="signin-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="signin-input"
              required
            />
            {loginError && <div className="error-message">{loginError}</div>}
          </div>
          <button type="submit" className="signin-button" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="oauth-buttons">
          <button
            onClick={() => oauthLogin("google")}
            className="oauth-button"
            disabled={isLoading}
            style={{
              backgroundImage: `url(${googleImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <span style={{ visibility: "hidden" }}>Google Login</span>
          </button>
          <button
            onClick={() => oauthLogin("github")}
            className="oauth-button"
            disabled={isLoading}
            style={{
              backgroundImage: `url(${githubImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <span style={{ visibility: "hidden" }}>Github Login</span>
          </button>
        </div>

        <div className="signin-footer">
          <span>계정이 필요한가요?</span>
          <button
            type="button"
            className="signup-link"
            onClick={() => navigate("/sign-up")}
          >
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
