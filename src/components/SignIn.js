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
        onLogin(token, userInfo.email, userInfo.role, userInfo.nickname);
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
    if (!window.electronAPI) {
      // 웹 환경에서의 처리
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user-service/api/v1/users/o-auth`,
          { params: { provider } }
        );

        if (response.data) {
          window.location.href = response.data;
        }
      } catch (error) {
        console.error("OAuth 로그인 요청 실패:", error);
        setLoginError("OAuth 요청 중 오류가 발생했습니다.");
      }
    } else {
      // Electron 환경에서의 처리
      try {
        setIsLoading(true);
        const result = await window.electronAPI.handleOAuth(provider);
        if (result?.error) {
          setLoginError(result.error);
        }
      } catch (error) {
        console.error("OAuth 로그인 요청 실패:", error);
        setLoginError("OAuth 요청 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // OAuth 콜백 처리
  useEffect(() => {
    if (window.electronAPI) {
      const handleOAuthCallback = (data) => {
        if (data.status === "OK") {
          const token = data.data;
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
          onLogin(token, userInfo.email, userInfo.role, userInfo.nickname);
          navigate("/", { replace: true });
        } else if (data.error) {
          setLoginError(`OAuth 로그인 실패: ${data.error}`);
        }
      };

      window.electronAPI.onOAuthCallback(handleOAuthCallback);
    }
  }, [navigate, onLogin]);

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
