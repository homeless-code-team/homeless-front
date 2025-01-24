import React from "react";
import "./UserProfilePopup.css";
import axiosInstansce from "../configs/axios-config";

const UserProfilePopup = ({ user, onClose }) => {
  if (!user) return null;

  const joinhandler = () => {
    const res = axiosInstansce.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/v1/users}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
  };

  return (
    <div className="profile-popup-overlay" onClick={onClose}>
      <div className="profile-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <div className="popup-avatar">{user.name?.charAt(0).toUpperCase()}</div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserProfilePopup;
