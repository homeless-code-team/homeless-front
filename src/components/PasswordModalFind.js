import React, { useState, useEffect } from "react";
import "./PasswordModule.css"; // 모달 스타일링 추가
import axios from "axios";
import axiosInstance from "../configs/axios-config";
import "./PasswordModuleFind.css";
import Swal from "sweetalert2";

const PasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(600); // 10분 제한

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEmailVerification = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/v1/users/confirm`,
        {
          email: email,
        }
      );
      if (res.data.code === 200) {
        Swal.fire("인증 코드가 전송되었습니다!", "", "success");
        setCountdown(600); // 타이머 초기화
      } else {
        Swal.fire("이메일 인증 실패!", "", "error");
      }
    } catch (error) {
      Swal.fire("이메일 인증 중 문제가 발생했습니다.", "", "error");
    }
  };

  const handleVerifyAuthCode = async () => {
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/v1/users/confirm`,
        {
          params: { email, token: authCode },
        }
      );
      if (res.data.code === 200) {
        setEmailVerified(true);
        Swal.fire("이메일 인증 성공!", "", "success");
      } else {
        Swal.fire("인증번호가 유효하지 않습니다!", "", "error");
      }
    } catch (error) {
      Swal.fire("인증번호 확인 중 문제가 발생했습니다.", "", "error");
    }
  };

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      Swal.fire("비밀번호가 일치하지 않습니다!", "", "error");
      return;
    }

    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/api/v1/users/password`,
        {
          email: email,
          password: password,
        },
      );
      if (res.data.code === 200) {
        Swal.fire("비밀번호가 성공적으로 변경되었습니다!", "", "success");
        onClose(); // 모달 닫기
      } else {
        Swal.fire("비밀번호 변경 실패!", "", "error");
      }
    } catch (error) {
      Swal.fire("비밀번호 변경 중 문제가 발생했습니다.", "", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {!emailVerified ? (
          <>
            <h2>비밀번호 변경</h2>
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
              />
              <button onClick={handleEmailVerification}>이메일 인증하기</button>
            </div>
            <div className="form-group">
              <label>인증번호</label>
              <input
                type="text"
                id="authCode"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="인증 코드를 입력하세요"
              />
              <button
                type="button"
                onClick={handleVerifyAuthCode}
                disabled={!authCode}
              >
                인증코드 확인
              </button>
              <div className="countdown">
                남은 시간: {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </>
        ) : (
          <>
            <h2>새 비밀번호 입력</h2>
            <div className="form-group">
              <label>새 비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
              />
            </div>
            <div className="form-group">
              <label>새 비밀번호 재입력</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 재입력"
              />
            </div>
            <button onClick={handleSavePassword}>비밀번호 저장</button>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordModal;
