import React, { useState, useContext } from "react";
import "./Profile.css";
import axios from "axios";
import AuthContext from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

const Profile = () => {
  const { userName, userId, onLogin } = useContext(AuthContext);
  const [description, setDescription] = useState("");
  const [activeSection, setActiveSection] = useState("내 계정");
  const [changeNicknameError, setChangeNicknameError] = useState("");
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setNewNickname(userName);
    setChangeNicknameError("");
    setShowNicknameModal(true);
  };

  const handleCloseModal = () => {
    setNewNickname("");
    setChangeNicknameError("");
    setShowNicknameModal(false);
  };

  const handleDuplicateNickname = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/duplicate?nickname=${newNickname}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.status === "OK") {
        setIsDuplicateChecked(true);
        setChangeNicknameError("사용 가능한 닉네임입니다.");
      } else {
        setIsDuplicateChecked(false);
        setChangeNicknameError("닉네임이 중복되었습니다.");
      }
    } catch (error) {
      console.error("닉네임 중복 확인 오류:", error);
      setIsDuplicateChecked(false);
      setChangeNicknameError("닉네임 중복 확인에 실패했습니다.");
    }
  };

  const handleNicknameChange = async () => {
    if (!newNickname) return;

    if (newNickname.length < 2 || newNickname.length > 8) {
      setChangeNicknameError("닉네임은 2~8자 사이여야 합니다.");
      return;
    }

    if (!isDuplicateChecked) {
      setChangeNicknameError("닉네임 중복 확인이 필요합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nickname", newNickname);
      const res = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.status === "OK") {
        const token = localStorage.getItem("token");
        const userEmail = localStorage.getItem("userEmail");
        const userRole = localStorage.getItem("userRole");

        onLogin(token, userEmail, userRole, newNickname);

        setNewNickname("");
        setIsDuplicateChecked(false);
        setChangeNicknameError("");
        setShowNicknameModal(false);
      } else {
        setChangeNicknameError(
          res.data.message || "닉네임 변경에 실패했습니다."
        );
      }
    } catch (error) {
      console.error("닉네임 변경 오류:", error);
      setChangeNicknameError("닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 4 || newPassword.length > 14) {
      setPasswordError("비밀번호는 4~14자 사이여야 합니다.");
      return;
    }

    try {
      const res = await axios.patch(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.status === 200) {
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPasswordError("");
        alert("비밀번호가 변경되었습니다.");
      }
    } catch (error) {
      setPasswordError("비밀번호 변경에 실패했습니다.");
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleGithubConnect = () => {
    // GitHub 연동 로직 구현
    console.log("GitHub 연동");
  };

  const handleOpenPasswordModal = () => {
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const menuItems = ["내 계정", "프로필"];

  const renderContent = () => {
    switch (activeSection) {
      case "내 계정":
        return (
          <>
            <div className="profile-section user-info">
              <div className="profile-header-section">
                <h3>{activeSection}</h3>
                <div className="profile-subtitle">
                  계정 정보를 확인하고 수정할 수 있습니다.
                </div>
              </div>
              <div className="profile-avatar-section">
                <div className="avatar-circle">
                  {userName?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <div className="profile-name">{userName}</div>
                  <div className="profile-tag">#1234</div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-title">계정 정보</div>
              <div className="profile-field">
                <label>이메일</label>
                <div className="field-value">{userId}</div>
              </div>
              <div className="profile-field connection-section">
                <label>연결된 계정</label>
                <div className="connection-info">
                  <div className="connection-item">
                    <span className="connection-name">GitHub</span>
                    <button
                      className="connection-button"
                      onClick={handleGithubConnect}
                    >
                      <FaGithub size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-title">계정 설정</div>
              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-text">
                    <div className="settings-label">닉네임</div>
                    <div className="settings-value">{userName}</div>
                  </div>
                  <button className="profile-button" onClick={handleOpenModal}>
                    ✎
                  </button>
                </div>
                <div className="settings-item">
                  <div className="settings-text">
                    <div className="settings-label">비밀번호</div>
                    <div className="settings-value">********</div>
                  </div>
                  <button
                    className="profile-button"
                    onClick={handleOpenPasswordModal}
                  >
                    ✎
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      case "프로필":
        return (
          <>
            <div className="profile-section user-info">
              <div className="profile-header-section">
                <h3>{activeSection}</h3>
                <div className="profile-subtitle">
                  프로필 정보를 설정할 수 있습니다.
                </div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-title">프로필 설명</div>
              <textarea
                className="profile-description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="자신을 소개해보세요"
                maxLength={190}
              />
              <div className="description-length">{description.length}/190</div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-layout">
      <div className="profile-sidebar">
        <div className="sidebar-content">
          <h2>사용자 설정</h2>
          <div className="profile-menu">
            {menuItems.map((item) => (
              <button
                key={item}
                className={`menu-item ${
                  activeSection === item ? "active" : ""
                }`}
                onClick={() => setActiveSection(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
      </div>

      <div className="profile-container">
        <div className="profile-content">{renderContent()}</div>
      </div>

      {showNicknameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>닉네임 변경</h3>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => {
                setNewNickname(e.target.value);
                setIsDuplicateChecked(false);
              }}
              placeholder="새로운 닉네임 입력"
              maxLength={8}
            />
            <button
              onClick={handleDuplicateNickname}
              className="duplicate-check-button"
            >
              중복 확인
            </button>
            {changeNicknameError && (
              <div
                className={`error-message ${
                  isDuplicateChecked ? "success" : ""
                }`}
              >
                {changeNicknameError}
              </div>
            )}
            <div className="modal-buttons">
              <button
                onClick={handleNicknameChange}
                disabled={!isDuplicateChecked}
              >
                변경
              </button>
              <button onClick={handleCloseModal}>취소</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>비밀번호 변경</h3>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="현재 비밀번호"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호"
            />
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="새 비밀번호 확인"
            />
            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}
            <div className="modal-buttons">
              <button onClick={handlePasswordChange}>변경</button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setPasswordError("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
