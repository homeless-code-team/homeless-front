
import React, { useState, useEffect } from "react";
import "./UserProfilePopup.css";
import axiosInstansce from "../configs/axios-config";

const UserProfilePopup = ({ user, onClose }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axiosInstansce.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/v1/users/get`,
          {
            params: {
              nickname: user.nickname,
            },
          }
        );
        if (res.data.code === 200) {
          setUserData(res.data.data);
        }
      } catch (error) {
        console.error("사용자 데이터 조회 실패:", error);
      }
    };

    if (user?.nickname) {
      fetchUserData();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="profile-popup-overlay" onClick={onClose}>
      <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <div className="popup-avatar">
          {userData?.profileImage ? (
            <img src={userData.profileImage} alt="프로필" />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        {userData && (
          <div className="user-details">
            <p className="user-contents">{userData.contents}</p>
            <p className="user-nickname">{userData.nickname}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePopup;
