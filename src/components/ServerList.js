import React, { useContext, useCallback, useEffect, useState } from "react";
import "./ServerList.css";
import { FaUserFriends, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import axios from "axios";
import { use } from "react";

const ServerList = React.memo(
  ({ serverList, onSelectServer, selectedServer, onOpenDM }) => {
    const navigate = useNavigate();
    const { onLogout } = useContext(AuthContext);
    // const [serverList, setServerList] = useState([]);

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

    // useEffect(() => {
    //   getServerList();
    // }, []);

    // const getServerList = async () => {
    //   const res = await axios.get("http://localhost:8181/server/servers", {
    //     headers: {
    //       Authorization: `Bearer ${localStorage.getItem("token")}`,
    //     },
    //   });
    //   console.log("res : ", res.data.result);
    //   setServerList(res.data.result);
    // };
    return (
      <div className="server-list">
        <div
          className={`dm-button ${selectedServer === "dm" ? "selected" : ""}`}
          onClick={() => onOpenDM()}
        >
          <FaUserFriends size={24} />
        </div>
        <div className="server-separator"></div>
        {serverList?.map((server) => (
          <div
            key={server.id}
            className={`server-item ${
              selectedServer === server.id ? "selected" : ""
            }`}
            onClick={() => onSelectServer(server.id, server.title)}
          >
            {server.title}
          </div>
        ))}
        <div style={{ marginTop: "auto" }}>
          <div className="server-separator"></div>
          <button
            className="profile-button"
            onClick={() => navigate("/profile")}
          >
            <FaUserCircle size={20} />
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>
    );
  }
);

ServerList.displayName = "ServerList";

export default ServerList;
