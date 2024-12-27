import React, { useContext } from "react";
import "./Profile.css";
import AuthContext from "../context/AuthContext.js";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { userName } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>프로필</h2>
        <div className="profile-content">
          <div className="profile-avatar">
            {userName?.charAt(0).toUpperCase() || "오류"}
          </div>
          <div className="profile-info">
            <h3>{userName}</h3>
          </div>
        </div>
        <button className="back-button" onClick={() => navigate("/")}>
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default Profile;
