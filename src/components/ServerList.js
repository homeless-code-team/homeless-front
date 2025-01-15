import React, { useContext, useCallback, useEffect, useState } from "react";
import "./ServerList.css";
import { FaUserFriends, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext.js";
import axios from "axios";
import { use } from "react";

const ServerList = React.memo(
  ({
    serverList,
    onSelectServer,
    selectedServer,
    onOpenDM,
    onRefreshServers,
  }) => {
    const navigate = useNavigate();
    const { onLogout } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [serverName, setServerName] = useState("");
    const [serverTag, setServerTag] = useState("");
    const [serverImage, setServerImage] = useState(null);
    const [contextMenu, setContextMenu] = useState({
      visible: false,
      x: 0,
      y: 0,
      serverId: null,
    });

    const handleLogout = () => {
      handleLogoutBack();
      handleLogoutelctron();
    };
    const handleLogoutBack = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/sign-out`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true, // 쿠키 포함
          }
        );
      } catch (error) {
        console.error("Data fetch error:", error);
      }
    };

    const handleLogoutelctron = useCallback(async () => {
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

    const handleCreateServer = () => {
      setIsModalOpen(true);
    };

    const handleCloseModal = () => {
      setIsModalOpen(false);
      setPreviewImage(null);
      setServerName("");
      setServerTag("");
      setServerImage(null);
    };

    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setServerImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const formData = new FormData();
        formData.append("title", serverName);
        formData.append("tag", serverTag);

        if (serverImage != null) {
          console.log("asdasd");

          formData.append("serverImg", serverImage);
        }

        const response = await axios.post(
          "http://localhost:8181/server/servers",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response);

        if (response.status === 200) {
          console.log("성공");

          handleCloseModal();
          if (onRefreshServers) {
            await onRefreshServers();
          }
        }
      } catch (error) {
        console.error("서버 생성 실패:", error);
        alert("서버 생성에 실패했습니다.");
      }
    };

    const handleContextMenu = useCallback((e, serverId) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.pageX,
        y: e.pageY,
        serverId,
      });
    }, []);

    const handleDeleteServer = async (serverId) => {
      try {
        const response = await axios.delete(
          `http://localhost:8181/server/servers?id=${serverId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          onSelectServer(null);
          setContextMenu({ visible: false, x: 0, y: 0, serverId: null });

          if (onRefreshServers) {
            await onRefreshServers();
          }

          alert("삭제되었습니다.");
          return;
        }
      } catch (error) {
        console.error("서버 삭제 실패:", error);
        alert("서버 삭제에 실패했습니다.");
      }
      setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
    };

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
            onClick={() => onSelectServer(server.id, server.title)}
            onContextMenu={(e) => handleContextMenu(e, server.id)}
          >
            {server.serverImg ? (
              <img
                src={`http://localhost:8181${server.serverImg}`}
                alt={server.title}
                className="server-image"
              />
            ) : (
              server.title
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
            <button onClick={() => handleDeleteServer(contextMenu.serverId)}>
              서버 삭제
            </button>
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
