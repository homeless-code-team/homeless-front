import React, { useContext, useCallback, useEffect, useState } from "react";
import "./ServerList.css";
import { FaUserFriends, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import axios from "axios";
import { use } from "react";
import Swal from "sweetalert2";
import { useServerList } from "../hooks/useServerList.js";

const ServerList = React.memo(
  ({
    serverList,
    onSelectServer,
    selectedServer,
    onOpenDM,
    onRefreshServers,
    userList,
  }) => {
    const navigate = useNavigate();
    const { onLogout } = useContext(AuthContext);

    const {
      isModalOpen,
      previewImage,
      serverName,
      serverTag,
      serverImage,
      contextMenu,
      handleSubmit,
      handleImageChange,
      handleCreateServer,
      userEmail,
      handleLogout,
      setContextMenu,
      handleLeaveServer,
      handleDeleteServer,
      handleContextMenu,
      handleCloseModal,
      setServerName,
      setServerTag,
    } = useServerList(onLogout, onSelectServer, onRefreshServers);

    useEffect(() => {
      const handleClick = () =>
        setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }, []);

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
            onClick={() =>
              onSelectServer(server.id, server.title, server.role, server.tag)
            }
            onContextMenu={(e) => handleContextMenu(e, server)}
          >
            {server.serverImg ? (
              <img
                src={server.serverImg}
                alt={"업따"}
                className="server-image"
              />
            ) : (
              server.serverImg
            )}
          </div>
        ))}
        <div>
          <div
            className="server-item create-server"
            onClick={handleCreateServer}
          >
            +
          </div>
        </div>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>새로운 커스텀서버 만들기</h2>
              <form onSubmit={handleSubmit}>
                <div
                  className="custom-file-upload"
                  onClick={() =>
                    document.getElementById("serverImageInput").click()
                  }
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="서버 이미지 미리보기"
                      className="preview-image"
                    />
                  ) : (
                    "이미지 업로드"
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  id="serverImageInput"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <input
                  type="text"
                  placeholder="서버 이름"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="서버 태그"
                  value={serverTag}
                  onChange={(e) => setServerTag(e.target.value)}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit">생성</button>
                  <button type="button" onClick={handleCloseModal}>
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {contextMenu.visible && (
          <div
            className="context-menu"
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
            }}
          >
            {contextMenu.serverEmail === userEmail ? (
              <button onClick={() => handleDeleteServer(contextMenu.serverId)}>
                서버 삭제
              </button>
            ) : (
              <button onClick={() => handleLeaveServer(contextMenu.serverId)}>
                서버 탈퇴
              </button>
            )}
          </div>
        )}
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
