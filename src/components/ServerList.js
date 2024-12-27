import React, { useContext, useCallback } from "react";
import "./ServerList.css";
import { FaUserFriends, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";

const ServerList = React.memo(
  ({ servers, onSelectServer, selectedServer, onOpenDM }) => {
    const navigate = useNavigate();
    const { onLogout } = useContext(AuthContext);

    const handleLogout = useCallback(async () => {
      try {
        if (!onLogout) {
          console.error("Logout function not available");
          return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");

        await onLogout();
        navigate("/");
      } catch (error) {
        console.error("Logout failed:", error);
        // 사용자에게 에러 메시지를 표시할 수 있습니다
      }
    }, [onLogout, navigate]);

    return (
      <div className="server-list">
        <div
          className={`dm-button ${selectedServer === "dm" ? "selected" : ""}`}
          onClick={() => onOpenDM()}
        >
          <FaUserFriends size={24} />
        </div>
        <div className="server-separator"></div>
        {servers?.map((server) => (
          <div
            key={server.id}
            className={`server-item ${
              selectedServer === server.id ? "selected" : ""
            }`}
            onClick={() => onSelectServer(server.id, server.name)}
          >
            {server.name.charAt(0)}
          </div>
        ))}
        <div className="server-separator"></div>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt size={20} />
        </button>
      </div>
    );
  }
);

ServerList.displayName = "ServerList";

export default ServerList;
