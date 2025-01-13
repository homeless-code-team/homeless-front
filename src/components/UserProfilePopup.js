import React from "react";
import "./UserProfilePopup.css";

const UserProfilePopup = ({ user, onClose }) => {
  if (!user) return null;

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
