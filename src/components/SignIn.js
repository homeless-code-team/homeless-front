import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import axios from "axios";
import "./SignIn.css";
import googleImage from "../asset/google.png";
import githubImage from "../asset/github.png";

const { ipcRenderer } = window.require("electron");

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  // ✅ 일반 로그인 처리
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
        onLogin(token); // 로그인 상태 업데이트
        navigate("/", { replace: true }); // 메인 페이지로 이동
      } else {
        setLoginError(res.data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const openOAuthWindow = (provider) => {
    ipcRenderer.send("open-oauth-window", provider);
  };

  ipcRenderer.on("oauth-success", (event, token) => {
    if (token === "EMAIL_EXISTS") {
      alert("이미 존재하는 이메일입니다.");
    } else {
      localStorage.setItem("token", token);
      navigate("/", { replace: true });
    }
  });

  return (
    <div className="signin-container">
      {isLoading && <div className="spinner">로딩 중...</div>}
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
              placeholder="이메일을 입력하세요"
              autoComplete="off"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="signin-input"
              placeholder="비밀번호를 입력하세요"
              autoComplete="off"
              required
            />
            <button type="button" onClick={togglePasswordVisibility}>
              {showPassword ? "숨기기" : "표시"}
            </button>
            {loginError && <div className="error-message">{loginError}</div>}
          </div>
          <button type="submit" className="signin-button" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="oauth-buttons">
          <button
            onClick={() => openOAuthWindow("google")}
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
            onClick={() => openOAuthWindow("github")}
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
