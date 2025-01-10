import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./SignUp.module.css";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [generatedAuthCode, setGeneratedAuthCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showAlert, setShowAlert] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isNicknameValid, setIsNicknameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isAuthCodeValid, setIsAuthCodeValid] = useState(true);
  const [authCodeSent, setAuthCodeSent] = useState(true);
  const [emailFeedback, setEmailFeedback] = useState("");
  const [authCodeFeedback, setAuthCodeFeedback] = useState("");
  const [nicknameFeedback, setNicknameFeedback] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:8181";
  const toggleSubmitButton = useCallback(() => {
    const submitButton = document.getElementById("submit-button");
    if (isEmailValid && isNicknameValid && isPasswordValid && isAuthCodeValid) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  }, [isEmailValid, isNicknameValid, isPasswordValid, isAuthCodeValid]);

  useEffect(() => {
    toggleSubmitButton();
  }, [
    isEmailValid,
    isNicknameValid,
    isPasswordValid,
    isAuthCodeValid,
    toggleSubmitButton,
  ]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(emailValue)) {
      setEmailFeedback("이메일이 유효합니다.");
      setIsEmailValid(true);
    } else {
      setEmailFeedback("올바른 이메일 형식이 아닙니다.");
      setIsEmailValid(false);
    }
  };

  const handleNicknameChange = (e) => {
    const nicknameValue = e.target.value;
    setNickname(nicknameValue);

    if (nicknameValue.length >= 2 && nicknameValue.length <= 8) {
      setNicknameFeedback("");
      setIsNicknameValid(true);
    } else {
      setNicknameFeedback("닉네임은 2~8자 사이여야 합니다.");
      setIsNicknameValid(false);
    }
  };

  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);

    if (passwordValue.length >= 4 && passwordValue.length <= 14) {
      setPasswordFeedback("");
      setIsPasswordValid(true);
    } else {
      setPasswordFeedback("비밀번호는 4~14자 사이여야 합니다.");
      setIsPasswordValid(false);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue);

    if (confirmPasswordValue === password) {
      setPasswordFeedback("");
      setIsPasswordValid(true);
    } else {
      setPasswordFeedback("비밀번호가 일치하지 않습니다.");
      setIsPasswordValid(false);
    }
  };

  const handleAuthCodeChange = (e) => {
    const authCodeValue = e.target.value;
    setAuthCode(authCodeValue);
  };

  const handleSendAuthCode = () => {
    if (isEmailValid) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      axios
        .post(`${API_BASE_URL}/user-service/api/v1/users/confirm`, { email })
        .then((response) => {
          if (response.status == 200) {
            console.log(response.status);
            setAuthCodeSent(true);
            setAuthCodeFeedback("인증 코드가 이메일로 전송되었습니다.");
            setCountdown(180);
          }
        })
        .catch((error) => {
          setAuthCodeFeedback("이메일 전송에 실패했습니다. 다시 시도해주세요.");
          setShowAlert(false);
        });
    }
  };
  const handleVerifyAuthCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `${API_BASE_URL}/user-service/api/v1/users/confirm`,
        {
          params: {
            email,
            token: authCode,
          },
        }
      );
      if (res.data.status === 200) {
        setIsAuthCodeValid(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.statusMessage || "비밀번호를 찾을 수 없습니다.";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEmailValid && isNicknameValid && isPasswordValid && isAuthCodeValid) {
      axios
        .post(`${API_BASE_URL}/user-service/api/v1/users/sign-up`, {
          email,
          nickname,
          password,
          authCode,
        })
        .then((response) => {
          alert("회원가입 성공!");
          navigate("/");
        })
        .catch((error) => {
          alert("회원가입 실패!");
        });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.signupBox}>
        <div className={styles.signupHeader}>
          <h2 className={styles.title}>회원가입</h2>
          <p className={styles.subtitle}>
            Homeless Code에 오신 것을 환영합니다!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="이메일을 입력하세요"
            />
            <div
              className={
                isEmailValid
                  ? styles["valid-feedback"]
                  : styles["invalid-feedback"]
              }
            >
              {emailFeedback}
            </div>
            <button
              type="button"
              onClick={handleSendAuthCode}
              disabled={!isEmailValid}
              className={styles.verifyButton}
            >
              이메일 인증
            </button>
            {showAlert ? (
              <div className={styles["valid-feedback"]}>
                이메일 인증 번호를 전송 중입니다.
              </div>
            ) : (
              <div className={styles["invalid-feedback"]}>
                {authCodeFeedback}
              </div>
            )}
          </div>

          {authCodeSent && (
            <div className={styles.formGroup}>
              <label htmlFor="auth-code">인증 코드</label>
              <input
                type="text"
                id="auth-code"
                value={authCode}
                onChange={handleAuthCodeChange}
                placeholder="인증 코드를 입력하세요"
              />
              <button
                type="button"
                onClick={handleVerifyAuthCode}
                disabled={!authCode || countdown === 0}
                className={styles.verifyButton}
              >
                인증 코드 확인
              </button>
              <span className={styles.countdown}>
                {isAuthCodeValid
                  ? ""
                  : countdown > 0
                  ? `남은 시간: ${Math.floor(countdown / 60)}분 ${
                      countdown % 60
                    }초`
                  : "시간 초과! 이메일 인증을 다시 시도하세요."}
              </span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="nickname">닉네임</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="닉네임을 입력하세요"
            />
            <div className={styles["invalid-feedback"]}>{nicknameFeedback}</div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호를 입력하세요"
            />
            <div className={styles["invalid-feedback"]}>{passwordFeedback}</div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirm-password">비밀번호 확인</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <button
            type="submit"
            id="submit-button"
            disabled={
              !isEmailValid ||
              !isNicknameValid ||
              !isPasswordValid ||
              !isAuthCodeValid
            }
          >
            회원가입
          </button>

          <div className={styles["login-link-container"]}>
            <span>이미 계정이 있으신가요?</span>
            <button
              type="button"
              className={styles["login-link"]}
              onClick={() => navigate("/")}
            >
              로그인하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
