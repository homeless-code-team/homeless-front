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
  const [previewImage, setPreviewImage] = useState(
    localStorage.getItem("profileImage") || null
  );
  const fileInputRef = React.useRef(null);

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
      const email = localStorage.getItem("userEmail");
      const params = new URLSearchParams({
        email: email,
        nickname: newNickname,
      });

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/duplicate?${params}`,
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

        // localStorage 업데이트
        localStorage.setItem("userName", newNickname);

        // AuthContext 업데이트
        onLogin(token, userEmail, userRole, newNickname);

        // 모달 닫기 전에 상태 업데이트 완료 대기
        await new Promise((resolve) => setTimeout(resolve, 100));

        setNewNickname("");
        setIsDuplicateChecked(false);
        setChangeNicknameError("");
        setShowNicknameModal(false);

        // 페이지 새로고침
        window.location.reload();
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
    // 현재 비밀번호 입력 확인
    if (!oldPassword) {
      setPasswordError("현재 비밀번호를 입력해주세요.");
      return;
    }

    // 새 비밀번호 입력 확인
    if (!newPassword) {
      setPasswordError("새 비밀번호를 입력해주세요.");
      return;
    }

    // 새 비밀번호 확인 입력 확인
    if (!confirmNewPassword) {
      setPasswordError("새 비밀번호 확인을 입력해주세요.");
      return;
    }

    // 새 비밀번호 일치 확인
    if (newPassword !== confirmNewPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 새 비밀번호 길이 확인
    if (newPassword.length < 4 || newPassword.length > 14) {
      setPasswordError("비밀번호는 4~14자 사이여야 합니다.");
      return;
    }

    // 현재 비밀번호와 새 비밀번호가 같은지 확인
    if (oldPassword === newPassword) {
      setPasswordError("새 비밀번호가 현재 비밀번호와 같습니다.");
      return;
    }

    try {
      // 현재 비밀번호 확인 요청
      const checkRes = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/password/check`,
        { password: oldPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (checkRes.data.status !== "OK") {
        setPasswordError("현재 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 새 비밀번호로 변경 요청
      const formData = new FormData();
      formData.append("password", newPassword);

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
        // 모달 상태 초기화
        setShowPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setPasswordError("");
        alert("비밀번호가 변경되었습니다.");
      } else {
        setPasswordError(res.data.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      setPasswordError(
        error.response?.data?.message || "비밀번호 변경에 실패했습니다."
      );
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleDescriptionSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("content", description);

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
        alert("프로필 설명이 변경되었습니다.");
      } else {
        alert(res.data.message || "프로필 설명 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 설명 변경 오류:", error);
      alert(
        error.response?.data?.message || "프로필 설명 변경에 실패했습니다."
      );
    }
  };

  const handleGithubConnect = () => {
    // GitHub 연동 로직 구현
    console.log("GitHub 연동");
  };

  const handleOpenPasswordModal = () => {
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    const tempPreviewUrl = URL.createObjectURL(file);
    setPreviewImage(tempPreviewUrl);

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

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
        const userName = localStorage.getItem("userName");

        // 새로운 프로필 이미지 URL을 저장하고 AuthContext 업데이트
        localStorage.setItem("profileImage", res.data.data.profileImage);
        onLogin(
          token,
          userEmail,
          userRole,
          userName,
          res.data.data.profileImage
        );

        alert("프로필 사진이 변경되었습니다.");
      } else {
        setPreviewImage(localStorage.getItem("profileImage"));
        alert(res.data.message || "프로필 사진 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 사진 변경 오류:", error);
      setPreviewImage(localStorage.getItem("profileImage"));
      alert(
        error.response?.data?.message || "프로필 사진 변경에 실패했습니다."
      );
    }
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
                <div
                  className="avatar-circle profile-image-container"
                  onClick={handleImageClick}
                  style={{ cursor: "pointer" }}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="프로필"
                      className="profile-image"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      {userName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="image-overlay">
                    <span>변경</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
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
              <div className="description-info">
                <div className="description-length">
                  {description.length}/190
                </div>
                <button
                  className="profile-button save-button"
                  onClick={handleDescriptionSubmit}
                  style={{ marginTop: "10px" }}
                >
                  저장
                </button>
              </div>
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
