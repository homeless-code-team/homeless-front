import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import { jwtDecode } from "jwt-decode"; // 올바른 jwtDecode 임포트
import axios from "axios";
import "./SignIn.css";
import googleImage from "../asset/google.png"; // 이미지 경로
import githubImage from "../asset/github.png"; // 이미지 경로

const API_BASE_URL = "http://localhost:8181";

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
        {
          email,
          password,
        }
      );

      const token = res.data.result.token;
      const decoded = jwtDecode(token);
      onLogin(token, decoded.sub, decoded.role, decoded.name);
    } catch (error) {
      const errorMessage =
        error.response?.data?.statusMessage || "비밀번호를 찾을 수 없습니다.";
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth 로그인 처리
  const oauthLogin = async (provider) => {
    try {
      setIsLoading(true);
      setLoginError("");

      const res = await axios.get(
        `${API_BASE_URL}/user-service/api/v1/users/o-auth`,
        {
          params: {
            provider,
          },
        }
      );

      if (res.data && res.data.result) {
        const token = res.data.result.token;
        const decoded = jwtDecode(token);
        onLogin(token, decoded.sub, decoded.role, decoded.nickname);
      } else {
        throw new Error("유효하지 않은 응답입니다.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.statusMessage || "서버 내부 오류가 발생했습니다.";
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
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

        {/* OAuth 로그인 버튼 */}
        <div className="oauth-buttons">
          <button
            onClick={() => oauthLogin("google")}
            className="oauth-button"
            style={{
              backgroundImage: `url(${googleImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <span style={{ visibility: "hidden" }}>Google Login</span>
          </button>
          <button
            onClick={() => oauthLogin("github")}
            className="oauth-button"
            style={{
              backgroundImage: `url(${githubImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <span style={{ visibility: "hidden" }}>GitHub Login</span>
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
