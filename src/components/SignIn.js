import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault(); // 새로고침 방지
    setIsLoading(true); // 로딩 상태 표시
    setLoginError(""); // 오류 메시지 초기화

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/sign-in`,
        {
          email,
          password,
        }
      );

      console.log("Login response:", res.data);

      if (res.data.status === "OK") {
        const token = res.data.data;
        console.log("Token:", token);

        const decoded = jwtDecode(token);
        const email = decoded.sub;
        const userId = decoded.user_id;
        const role = decoded.role;
        const nickname = decoded.nickname;

        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userName", nickname);

        onLogin(token, email, role, nickname);
        navigate("/");
      } else {
        setLoginError(res.data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTempLogin = () => {
    const tempToken = "temp-token";
    const tempId = "testId@test.com";
    const tempRole = "ROLE_USER";
    const tempName = "테스트계정";

    // localStorage에 임시 데이터 저장
    localStorage.setItem("token", tempToken);
    localStorage.setItem("userId", tempId);
    localStorage.setItem("userRole", tempRole);
    localStorage.setItem("userName", tempName);

    onLogin(tempToken, tempId, tempRole, tempName);
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
          <button
            type="button"
            className="temp-login-button"
            onClick={handleTempLogin}
          >
            임시 로그인
          </button>
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
        </form>
      </div>
    </div>
  );
};

export default SignIn;
