import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./SignIn.css";
import googleImage from "../asset/google.png";
import githubImage from "../asset/github.png";
import Swal from "sweetalert2";
import { oauthLogin } from "./oauthLogin.js";

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
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/sign-in`,
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
        Swal.fire("실패", "이메일 또는 비밀번호가 올바르지 않습니다.", "error");
      }
    } catch (error) {
      Swal.fire("실패", "이메일 또는 비밀번호가 올바르지 않습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const token = await oauthLogin(provider);
      if (token) {

        localStorage.setItem("accessToken", token);
        window.location.reload(); // 로그인 후 페이지 새로고침
      }
    } catch (error) {
      console.error("OAuth 로그인 실패:", error);
    }
  }

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
            onClick={() => handleOAuthLogin("google")}
            className="oauth-button"
            disabled={isLoading}
          >
            <img src={googleImage} alt="Google Login" className="oauth-logo google-logo" />
          </button>
          <button
            onClick={() => handleOAuthLogin("github")}
            className="oauth-button"
            disabled={isLoading}
          >
            <img src={githubImage} alt="Github Login" className="oauth-logo github-logo" />
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
