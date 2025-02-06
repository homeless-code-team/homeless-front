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

  const [uiScale, setUiScale] = useState({
    container: { maxWidth: 480 },
    title: { fontSize: 24 },
    timer: { width: 12, fontSize: 10 },
    form: { fontSize: 14, padding: 32 },
    input: { height: 40, fontSize: 14, padding: 10 },
    button: { height: 36, fontSize: 14, padding: '8px 16px' },
    feedback: { fontSize: 12, marginTop: 4 },
    progressBar: { height: 4 }
  });

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 윈도우 크기에 따른 UI 크기 조정
  useEffect(() => {
    const updateUIScale = async () => {
      try {
        const [width] = await window.WindowControls.getWindowSize();
        const scale = Math.min(Math.max(width / 1200, 0.8), 1.2);

        setUiScale({
          container: {
            maxWidth: Math.round(480 * scale)
          },
          title: {
            fontSize: Math.round(24 * scale)
          },
          timer: {
            width: Math.round(12 * scale),
            fontSize: Math.round(10 * scale)
          },
          form: {
            fontSize: Math.round(14 * scale),
            padding: Math.round(32 * scale)
          },
          input: {
            height: Math.round(40 * scale),
            fontSize: Math.round(14 * scale),
            padding: Math.round(10 * scale)
          },
          button: {
            height: Math.round(36 * scale),
            fontSize: Math.round(14 * scale),
            padding: `${Math.round(8 * scale)}px ${Math.round(16 * scale)}px`
          },
          feedback: {
            fontSize: Math.round(12 * scale),
            marginTop: Math.round(4 * scale)
          },
          progressBar: {
            height: Math.round(4 * scale)
          }
        });
      } catch (error) {
        console.error('윈도우 크기 조회 실패:', error);
      }
    };

    updateUIScale();
    window.WindowControls.onWindowResize((event, size) => {
      const scale = Math.min(Math.max(size.width / 1200, 0.8), 1.2);
      updateUIScale();
    });
  }, []);

  // 스타일 객체들
  const containerStyles = {
    maxWidth: `${uiScale.container.maxWidth}px`
  };

  const titleStyles = {
    fontSize: `${uiScale.title.fontSize}px`
  };

  const formStyles = {
    fontSize: `${uiScale.form.fontSize}px`,
    padding: `${uiScale.form.padding}px`
  };

  const inputStyles = {
    height: `${uiScale.input.height}px`,
    fontSize: `${uiScale.input.fontSize}px`,
    padding: `${uiScale.input.padding}px`
  };

  const buttonStyles = {
    height: `${uiScale.button.height}px`,
    fontSize: `${uiScale.button.fontSize}px`,
    padding: uiScale.button.padding
  };

  const feedbackStyles = {
    fontSize: `${uiScale.feedback.fontSize}px`,
    marginTop: `${uiScale.feedback.marginTop}px`
  };

  const progressBarStyles = {
    height: `${uiScale.progressBar.height}px`
  };

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

  // 비밀번호 강도 표시 컴포넌트
  const PasswordStrengthBar = ({ requirements }) => {
    const strength = Object.values(requirements).filter(Boolean).length;
    const percentage = (strength / 4) * 100;

    return (
      <div className={styles.strengthBar}>
        <div
          className={styles.strengthFill}
          style={{
            width: `${percentage}%`,
            backgroundColor:
              percentage <= 25
                ? "red"
                : percentage <= 50
                ? "orange"
                : percentage <= 75
                ? "yellow"
                : "green",
          }}
        />
      </div>
    );
  };

  // 입력 필드 상태 아이콘
  const StatusIcon = ({ isValid, isAvailable }) => {
    if (isValid && isAvailable)
      return <span className={styles.successIcon}>✓</span>;
    if (!isValid) return <span className={styles.errorIcon}>✗</span>;
    return null;
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

  return (
    <div className={styles.container}>
      <div className={styles.progressBar} style={progressBarStyles}>
        <div
          className={styles.progressFill}
          style={{ width: `${formProgress}%`, height: '100%' }}
        />
      </div>
      <div className={styles.signupBox} style={{ ...formStyles, ...containerStyles }}>
        <h2 className={styles.title} style={titleStyles}>회원가입</h2>
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
              style={inputStyles}
            />
            <button
              type="button"
              onClick={() => handleCheckDuplicate("email", email)}
              disabled={!isEmailValid || !email || isEmailAvailable}
              style={buttonStyles}
            >
              {isEmailAvailable ? "확인 완료" : "중복 확인"}
            </button>
            <div style={feedbackStyles}>{emailFeedback}</div>
            {isEmailAvailable && (
              <button
                type="button"
                onClick={handleSendAuthCode}
                className={styles.mainButton}
                disabled={authCodeSent || !isEmailValid}
                style={buttonStyles}
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
                <>
                  <input
                    type="text"
                    id="authCode"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="인증 코드를 입력하세요"
                    style={inputStyles}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAuthCode}
                    disabled={!authCode}
                    style={buttonStyles}
                  >
                    인증 확인
                  </button>
                  {countdown > 0 && (
                    <div className={styles.countdown}>
                      <svg viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${(countdown / 600) * 100}, 100`}
                        />
                      </svg>
                      <span>
                        {Math.floor(countdown / 60)}:
                        {(countdown % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className={styles.successButton}
                >
                  인증 완료 ✓
                </button>
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
              style={inputStyles}
            />
            <button
              type="button"
              onClick={() => handleCheckDuplicate("nickname", nickname)}
              disabled={!isNicknameValid || !nickname || isNicknameAvailable}
              style={buttonStyles}
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
              style={inputStyles}
            />
            <PasswordStrengthBar
              requirements={checkPasswordRequirements(password)}
            />
            <div className={styles.requirements}>
              {Object.entries(checkPasswordRequirements(password)).map(
                ([key, met]) => (
                  <div key={key} className={met ? styles.met : styles.unmet}>
                    {key === "length" && "8~16자 길이"}
                    {key === "lowercase" && "소문자 포함"}
                    {key === "number" && "숫자 포함"}
                    {key === "specialChar" && "특수문자 포함"}
                  </div>
                )
              )}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyles}
            />
          </div>
          <button
            type="submit"
            disabled={
              !isEmailValid ||
              !isNicknameValid ||
              !isPasswordValid ||
              !isAuthCodeValid
            }
            style={buttonStyles}
          >
            회원가입
          </button>
        </form>
        <div className={styles.loginLink}>
          <span>이미 계정이 있으신가요?</span>
          <button type="button" onClick={handleGoToLogin} style={buttonStyles}>
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
