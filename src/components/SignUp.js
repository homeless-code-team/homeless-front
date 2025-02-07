import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SignUp.module.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isNicknameValid, setIsNicknameValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isAuthCodeValid, setIsAuthCodeValid] = useState(false);
  const [authCodeSent, setAuthCodeSent] = useState(true);
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState("");
  const [authCodeFeedback, setAuthCodeFeedback] = useState("");
  const [nicknameFeedback, setNicknameFeedback] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [formProgress, setFormProgress] = useState(0);
  const navigate = useNavigate();

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
    setIsEmailAvailable(false);
    setAuthCodeSent(false);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(emailValue)) {
      setEmailFeedback("이메일이 유효합니다. 중복 확인을 해주세요.");
      setIsEmailValid(true);
    } else {
      setEmailFeedback("올바른 이메일 형식이 아닙니다.");
      setIsEmailValid(false);
    }
  };

  //닉네임 변경 메서드
  const handleNicknameChange = (e) => {
    const nicknameValue = e.target.value;
    setNickname(nicknameValue);
    setIsNicknameAvailable(false);

    if (nicknameValue.length >= 2 && nicknameValue.length <= 8) {
      setNicknameFeedback("닉네임 중복 확인을 해주세요.");
      setIsNicknameValid(true);
    } else {
      setNicknameFeedback("닉네임은 2~8자 사이여야 합니다.");
      setIsNicknameValid(false);
    }
  };

  const checkPasswordRequirements = (password) => {
    return {
      length: password.length >= 8 && password.length <= 16,
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password),
    };
  };

  useEffect(() => {
    const requirements = checkPasswordRequirements(password);
    const isValidPassword = Object.values(requirements).every(Boolean);

    if (!isValidPassword) {
      setPasswordFeedback("비밀번호 요구사항을 모두 충족해야 합니다.");
      setIsPasswordValid(false);
    } else if (password !== confirmPassword) {
      setPasswordFeedback("비밀번호가 일치하지 않습니다.");
      setIsPasswordValid(false);
    } else {
      setPasswordFeedback("");
      setIsPasswordValid(true);
    }
  }, [password, confirmPassword]);

  // 유효성 및 중복성 검사
  const handleCheckDuplicate = async (type, value) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/duplicate`,
        {
          params: { [type]: value },
        }
      );

      if (response.status === 200 && response.data.code === 200) {
        if (type === "email") {
          setEmailFeedback("사용 가능한 이메일입니다.");
          setIsEmailAvailable(true);
          setAuthCodeSent(false);
        } else if (type === "nickname") {
          setNicknameFeedback("사용 가능한 닉네임입니다.");
          setIsNicknameAvailable(true);
        }
      } else if (response.data.code === 401) {
        if (type === "email") {
          setEmailFeedback("이미 사용 중인 이메일입니다.");
          setIsEmailAvailable(false);
        } else if (type === "nickname") {
          setNicknameFeedback("이미 사용 중인 닉네임입니다.");
          setIsNicknameAvailable(false);
        }
      }
    } catch {
      const genericError = "중복 확인 중 알 수 없는 오류가 발생했습니다.";
      if (type === "email") setEmailFeedback(genericError);
      if (type === "nickname") setNicknameFeedback(genericError);
    }
  };

  // 인증코드 이메이 전송
  const handleSendAuthCode = async () => {
    if (isEmailAvailable) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/confirm`,
          { email }
        );
        if (response.data.code === 200) {
          setAuthCodeSent(true);
          setAuthCodeFeedback("인증 코드가 이메일로 전송되었습니다.");
          setCountdown(600);
        }
      } catch {
        setAuthCodeFeedback("이메일 전송에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleVerifyAuthCode = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/confirm`,
        {
          params: { email, token: authCode },
        }
      );
      if (response.status === 200) {
        setIsAuthCodeValid(true);
        setAuthCodeFeedback("인증 성공!");
        setCountdown(0);
      }
    } catch {
      setAuthCodeFeedback("인증 코드 확인에 실패했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      isEmailValid &&
      isNicknameValid &&
      isPasswordValid &&
      isAuthCodeValid &&
      isEmailAvailable &&
      isNicknameAvailable
    ) {
      try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("nickname", nickname);
        formData.append("password", password);

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/sign-up`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status === 200) {
          await Swal.fire(
            "성공",
            "회원가입이 성공적으로 완료되었습니다!",
            "success"
          );
          navigate("/");
        }
      } catch {
        Swal.fire(
          "실패",
          "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
          "error"
        );
      }
    } else {
      Swal.fire(
        "알림",
        "모든 필드를 올바르게 입력했는지 확인하세요.",
        "warning"
      );
    }
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  // 폼 진행률 업데이트
  useEffect(() => {
    const completedSteps = [
      isEmailValid && isEmailAvailable,
      isAuthCodeValid,
      isNicknameValid && isNicknameAvailable,
      isPasswordValid,
    ].filter(Boolean).length;

    setFormProgress((completedSteps / 4) * 100);
  }, [
    isEmailValid,
    isEmailAvailable,
    isAuthCodeValid,
    isNicknameValid,
    isNicknameAvailable,
    isPasswordValid,
  ]);

  // 입력 필드 상태 아이콘
  const StatusIcon = ({ isValid, isAvailable }) => {
    if (isValid && isAvailable)
      return <span className={styles.successIcon}>✓</span>;
    if (!isValid) return <span className={styles.errorIcon}>✗</span>;
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}></div>
      <div className={styles.signupBox}>
        <h2 className={styles.title}>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              이메일
              <StatusIcon
                isValid={isEmailValid}
                isAvailable={isEmailAvailable}
              />
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="이메일을 입력하세요"
            />
            <button
              type="button"
              onClick={() => handleCheckDuplicate("email", email)}
              disabled={!isEmailValid || !email || isEmailAvailable}
            >
              {isEmailAvailable ? "확인 완료" : "중복 확인"}
            </button>
            <div>{emailFeedback}</div>
            {isEmailAvailable && (
              <button
                type="button"
                onClick={handleSendAuthCode}
                className={styles.mainButton}
                disabled={authCodeSent || !isEmailValid}
              >
                {authCodeSent ? "인증코드 발송됨" : "인증코드 발송"}
              </button>
            )}
          </div>
          {authCodeSent && (
            <div className={styles.formGroup}>
              <label htmlFor="authCode">
                인증 코드
                <StatusIcon isValid={isAuthCodeValid} />
              </label>
              {!isAuthCodeValid ? (
                <input
                  type="text"
                  id="authCode"
                  value={authCode}
                  placeholder="인증 코드를 입력하세요"
                />
              ) : (
                <div className={styles.authCodeValid}>인증 완료</div>
              )}
              <div>{authCodeFeedback}</div>
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="nickname">
              닉네임
              <StatusIcon
                isValid={isNicknameValid}
                isAvailable={isNicknameAvailable}
              />
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="닉네임을 입력하세요"
            />
            <button
              type="button"
              onClick={() => handleCheckDuplicate("nickname", nickname)}
              disabled={!isNicknameValid || !nickname || isNicknameAvailable}
            >
              {isNicknameAvailable ? "확인 완료" : "중복 확인"}
            </button>
            <div>{nicknameFeedback}</div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">
              비밀번호
              <StatusIcon isValid={isPasswordValid} />
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
            <div>{passwordFeedback}</div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
          <button
            type="submit"
            className={styles.mainButton}
            disabled={formProgress < 100}
          >
            회원가입
          </button>
        </form>
        <div className={styles.loginLink}>
          <span>이미 계정이 있으신가요?</span>
          <button type="button" onClick={handleGoToLogin}>
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
