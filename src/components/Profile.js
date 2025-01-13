import React, { useState, useContext, useEffect } from "react";
import "./Profile.css";
import AuthContext from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { userName: initialUserName, userId } = useContext(AuthContext);
  const [description, setDescription] = useState("");
  const [activeSection, setActiveSection] = useState("내 계정");
  const [userName, setUserName] = useState("username");
  const [profileImage, setProfileImage] = useState("");
  const [password, setPassword] = useState("");
  const [localProfileImage, setLocalProfileImage] = useState(profileImage);
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // 저장된 토큰 키 확인 필요
  const API_BASE_URL = "http://localhost:8181/user-service";

  const handleNicknameUpdate = async () => {
    const res = await axios.patch(
      `${API_BASE_URL}/api/v1/users`,
      { nickname: userName },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // 쿠키 포함
      }
    );

    if (res.status === 200) {
      console.log("닉네임 수정 성공:", res.data);
      alert("닉네임이 성공적으로 변경되었습니다!");
    } else if (res.status !== 200) {
      console.log("닉네임 수정 실패:", res.status);
      alert("닉네임 변경이 실패하였습니다!");
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0]; // 사용자가 업로드한 파일

    const formData = new FormData();
    formData.append("profileImage", file); // 파일 데이터를 FormData로 추가

    try {
      // 백엔드로 업로드 요청
      const res = await axios.patch(`${API_BASE_URL}/api/v1/users`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // 인증 헤더
        },
        withCredentials: true, // 쿠키 포함
      });

      if (res.status === 200) {
        const profileImageUrl = res.data.data.profileImage; // 반환된 S3 URL
        if (res.data.data.profileImage !== 1) {
          setProfileImage(profileImageUrl); // S3 URL을 상태로 저장
          alert("프로필 이미지가 성공적으로 변경되었습니다!");
        } else {
          alert("S3 URL을 가져오지 못했습니다.");
        }
      } else {
        alert("이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 문제가 발생했습니다.");
    }
  };

  const handlePasswordUpdate = async () => {
    const res = await axios.patch(
      `${API_BASE_URL}/api/v1/users`,
      { setPassword },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // 쿠키 포함
      }
    );

    if (res.status === 200) {
      console.log("비밀번호 수정 성공:", res.data);
      alert("비밀번호 변경이 성공하였습니다!");
    } else console.log("비밀번호 수정 실패:", res.status);
    alert("비밀번호 변경이 실패하였습니다!");
  };

  const handleContentUpdate = async () => {
    const res = await axios.patch(
      `${API_BASE_URL}/api/v1/users`,
      { content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // 쿠키 포함
      }
    );

    if (res.status === 200) {
      console.log("소개글글 수정 성공:", res.data);
      alert("소개글이 성공적으로 변경되었습니다!");
    } else if (res.status !== 200) {
      console.log("소개글 수정 실패:", res.status);
      alert("소개글 변경이 실패하였습니다!");
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };
  // 서버 데이터 요청 함수
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

      if (res.status === 200) {
        console.log(`Fetched ${section} data:`, res.data);
        if (section === "내 계정") {
          setProfileImage(res.data.data.profileImage || "");
          console.log("====================================");
          console.log(res.data.data.profileImage);
          console.log("====================================");
          setUserName(res.data.data.nickname || "");
        } else if (section === "프로필") {
          setContent(res.data.data.content || "");
          console.log("====================================");
          console.log(res.data.data.content);
          console.log("====================================");
        }
      } else {
        console.error(`Failed to fetch ${section} data:`, res.status);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
    }
  };

  // 메뉴 변경 시 데이터 요청
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
                {/* 숨겨진 파일 입력 */}
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleProfileImageChange} // 파일 선택 시 호출
                />{" "}
                <div className="profile-name">{initialUserName}</div>
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
                    {/* userName을 placeholder로 설정 입력값을 state로 업데이트 */}
                    <input
                      type="text"
                      className="settings-value"
                      placeholder={initialUserName}
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
                  <div className="settings-text">
                    <div className="settings-label">비밀번호</div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="signin-input"
                      required
                    />
                  </div>
                </div>
                <button
                  className="profile-button"
                  onClick={handlePasswordUpdate}
                >
                  ✎
                </button>
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
                value={content || ""} // context가 없으면 빈 문자열
                onChange={(e) => setContent(e.target.value)} // 입력값 업데이트
                placeholder={content ? "" : "자신을 소개해보세요"} // context가 있으면 placeholder 비움
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
    </div>
  );
};

export default Profile;
