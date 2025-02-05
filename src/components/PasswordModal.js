import React, { useState } from "react";
import "./PasswordModule.css"; // 모달 스타일링 추가
import axios from "axios";
import axiosInstance from "../configs/axios-config.js";

const PasswordModal = ({ onClose }) => {
  const [emailVerified, setEmailVerified] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const email = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  if (email) {
    console.log("Email:", email);
  } else {
    console.log("Key 'userid' not found in localStorage");
  }

  const handleEmailVerification = async () => {
    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}/api/v1/users/confirm`,
        {
          email: email,
        }
      );
      console.log("====================================");
      console.log(email);
      console.log("====================================");
      if (res.data.code === 200) {
        alert("인증 코드가 전송되었습니다!");
      } else {
        alert("이메일 인증 실패!");
      }
    } catch (error) {
      console.error("이메일 인증 오류:", error);
      alert("이메일 인증 중 문제가 발생했습니다.");
    }
  };

  const handleVerifyAuthCode = async () => {
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/confirm`,
        {
          params: { email, token: authCode },
        }
      );
      if (res.data.code === 200) {
        setEmailVerified(true);
        alert("이메일 인증 성공!");
      } else {
        alert("인증번호가 유효하지 않습니다!");
      }
    } catch (error) {
      console.error("인증번호 확인 오류:", error);
      alert("인증번호 확인 중 문제가 발생했습니다.");
    }
  };

  const handleSavePassword = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }
    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users`,
        {
          password: password,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // 쿠키 포함
        }
      );
      if (res.data.code === 200) {
        alert("비밀번호가 성공적으로 변경되었습니다!");
        onClose(); // 모달 닫기
      } else {
        alert("비밀번호 변경 실패!");
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      alert("비밀번호 변경 중 문제가 발생했습니다.");
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
