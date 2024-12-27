import React, { useState, useContext } from "react";
import "./Profile.css";
import AuthContext from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { userName, userEmail } = useContext(AuthContext);
  const [description, setDescription] = useState("");
  const [activeSection, setActiveSection] = useState("내 계정");
  const navigate = useNavigate();

  const handleNicknameChange = () => {
    // TODO: 닉네임 변경 로직 구현
    console.log("닉네임 변경");
  };

  const handlePasswordChange = () => {
    // TODO: 비밀번호 변경 로직 구현
    console.log("비밀번호 변경");
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
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
                <div className="field-value">{userEmail}</div>
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
                  <button
                    className="profile-button"
                    onClick={handleNicknameChange}
                  >
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
                    onClick={handlePasswordChange}
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
              <div className="section-title">연결</div>
              <div className="connection-info">
                <div className="connection-text">연결된 계정이 없습니다.</div>
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
    </div>
  );
};

export default Profile;
