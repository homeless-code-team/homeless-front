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
import PasswordModal from "./PasswordModalFind";
import styles from "./SignIn.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const handleSendAuthCode = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/confirm`,
        { email }
      );
      if (response.data.code === 200) {
        Swal.fire("인증 코드가 전송되었습니다!", "", "success");
        setCountdown(600); // 타이머 시작
      } else {
        Swal.fire("이메일 인증 실패!", "", "error");
      }
    } catch (error) {
      Swal.fire("이메일 인증 중 문제가 발생했습니다.", "", "error");
    }
  };

  const handlePasswordModalOpen = () => setShowPasswordModal(true);
  const handlePasswordModalClose = () => setShowPasswordModal(false);

  return (
    <div className={styles.container}>
      <div className={styles.signinBox}>
        <div className={styles.signinHeader}>
          <h2>Welcome back!</h2>
          <p>Homeless Code에서 다시 만나 반가워요</p>
        </div>
        <form onSubmit={handleLogin} className={styles.signinForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.signinInput}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.signinInput}
              required
            />
            {loginError && <div className={styles.errorMessage}>{loginError}</div>}
          </div>
          <button
            type="button"
            className={styles.signupLinks}
            onClick={handlePasswordModalOpen}
          >
            비밀번호 재발급
          </button>
          <button type="submit" className={styles.signinButton} disabled={isLoading}>
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        <div className={styles.oauthButtons}>
          <button
            onClick={() => handleOAuthLogin("google")}
            className={styles.oauthButton}
            disabled={isLoading}
          >
            <img src={googleImage} alt="Google Login" className={styles.oauthLogo} />
          </button>
          <button
            onClick={() => handleOAuthLogin("github")}
            className={styles.oauthButton}
            disabled={isLoading}
          >
            <img src={githubImage} alt="Github Login" className={styles.oauthLogo} />
          </button>
        </div>

        <div className={styles.signinFooter}>
          <span>계정이 필요한가요?</span>
          <button
            type="button"
            className={styles.signupLink}
            onClick={() => navigate("/sign-up")}
          >
            가입하기
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal onClose={handlePasswordModalClose} />
      )}
    </div>
  );
};

export default SignIn;
