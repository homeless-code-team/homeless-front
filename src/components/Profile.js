import React, { useState, useContext, useEffect } from "react";
import "./Profile.css";
import AuthContext from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PasswordModal from "./PasswordModal.js"; // 비밀번호 변경 모달 컴포넌트 추가

const Profile = () => {
  const { userName: initialUserName, userId } = useContext(AuthContext);
  const [description, setDescription] = useState("");
  const [activeSection, setActiveSection] = useState("내 계정");
  const [userName, setUserName] = useState("username");
  const [profileImage, setProfileImage] = useState("");
  const [password, setPassword] = useState("");
  const [localProfileImage, setLocalProfileImage] = useState(profileImage);
  const [content, setContent] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false); // 비밀번호 변경 모달 상태 추가
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // 저장된 토큰 키 확인 필요
  const API_BASE_URL = "http://localhost:8181/user-service";

  const handleContentUpdate = async () => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/users`,
        { content },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // 쿠키 포함
        }
      );

      if (res.data.code === 200) {
        console.log("소개글이 수정 성공:", res.data);
        alert("소개글이 성공적으로 변경되었습니다!");

        // 닉네임 변경 성공 시 상태 업데이트
        setUserName(res.data.data.nickname || userName);
      } else {
        console.log("소개글수정 실패:", res.status);
        alert("닉네임 소게글이 실패하였습니다!");
      }
    } catch (error) {
      console.error("닉네임 변경 요청 실패:", error);
      alert("닉네임 변경 중 문제가 발생했습니다.");
    }
  };

  const handleNicknameUpdate = async () => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/users`,
        { nickname: userName },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true, // 쿠키 포함
        }
      );

      if (res.data.code === 200) {
        console.log("닉네임 수정 성공:", res.data);
        alert("닉네임이 성공적으로 변경되었습니다!");

        // 닉네임 변경 성공 시 상태 업데이트
        setUserName(res.data.data.nickname || userName);
      } else {
        console.log("닉네임 수정 실패:", res.status);
        alert("닉네임 변경이 실패하였습니다!");
      }
    } catch (error) {
      console.error("닉네임 변경 요청 실패:", error);
      alert("닉네임 변경 중 문제가 발생했습니다.");
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl); // 로컬 미리보기 반영

      const formData = new FormData();
      formData.append("profileImage", file);

      try {
        const res = await axios.patch(
          `${API_BASE_URL}/api/v1/users`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (res.data.code === 200) {
          const profileImageUrl = res.data.data.profileImage;
          const timestamp = new Date().getTime();
          setProfileImage(`${profileImageUrl}?t=${timestamp}`); // 캐시 무효화 URL 적용
          alert("프로필 이미지가 성공적으로 변경되었습니다!");
        } else {
          alert("이미지 업로드에 실패했습니다.");
        }
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드 중 문제가 발생했습니다.");
      }
    }
  };

  const handlePasswordModalOpen = () => setShowPasswordModal(true); // 모달 열기
  const handlePasswordModalClose = () => setShowPasswordModal(false); // 모달 닫기

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const fetchData = async (section) => {
    try {
      let endpoint = "";
      if (section === "내 계정") {
        endpoint = "/api/v1/users"; // 예: 계정 정보 API
      } else if (section === "프로필") {
        endpoint = "/api/v1/users"; // 예: 프로필 정보 API
      }

      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (res.data.code === 200) {
        console.log(`Fetched ${section} data:`, res.data);
        if (section === "내 계정") {
          setProfileImage(res.data.data.profileImage || "");
          setUserName(res.data.data.nickname || "");
        } else if (section === "프로필") {
          setContent(res.data.data.content || "");
        }
      } else {
        console.error(`Failed to fetch ${section} data:`, res.status);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData(activeSection);
  }, [activeSection]);

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
                <label htmlFor="profileImageInput" className="avatar-circle">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="프로필"
                      className="avatar-image"
                    />
                  ) : (
                    userName?.charAt(0).toUpperCase()
                  )}
                </label>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfileImageChange}
                />
                <div className="profile-name">{userName}</div>
                <div className="profile-tag">#1234</div>
                <div className="profile-info"></div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-title">계정 정보</div>
              <div className="profile-field">
                <label>이메일</label>
                <div className="field-value">{userId}</div>
              </div>
            </div>

            <div className="profile-section">
              <div className="section-title">계정 설정</div>
              <div className="settings-list">
                <div className="settings-item">
                  <div className="settings-text">
                    <div className="settings-label">닉네임</div>
                    <input
                      type="text"
                      className="settings-value"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  <button
                    className="profile-button"
                    onClick={handleNicknameUpdate}
                  >
                    ✎
                  </button>
                </div>
                <div className="settings-item">
                  <button
                    className="profile-button"
                    onClick={handlePasswordModalOpen} // 비밀번호 변경 모달 열기
                  >
                    비밀번호 변경
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
                value={content || ""}
                onChange={(e) => setContent(e.target.value)}
                placeholder={content ? "" : "자신을 소개해보세요"}
                maxLength={190}
              />
              <div className="description-length">
                {(content || "").length}/190
              </div>
              <button className="profile-button" onClick={handleContentUpdate}>
                ✎
              </button>
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

      {showPasswordModal && (
        <PasswordModal onClose={handlePasswordModalClose} />
      )}
    </div>
  );
};

export default Profile;
