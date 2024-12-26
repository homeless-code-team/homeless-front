import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./SignIn.css";

const API_BASE_URL = "http://localhost:8181";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/user/sign-in`, {
        email,
        password,
      });

      const token = res.data.result.token;
      const id = jwtDecode(token).sub;
      const role = jwtDecode(token).role;
      const name = jwtDecode(token).name;

      onLogin(token, id, role, name);
    } catch (error) {
      const errorMessage =
        error.response?.data?.statusMessage || "로그인 실패!";
      alert(errorMessage);
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
          </div>
          <button type="submit" className="signin-button" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
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
