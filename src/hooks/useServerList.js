// hooks/useServerList.js
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export const useServerList = (
  onLogout,
  onSelectServer,
  onRefreshServers,
  setPosts,
  setPage
) => {
  const navigate = useNavigate();
  //   const { onLogout } = useContext(AuthContext);
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

  const userEmail = localStorage.getItem("userEmail");

  const handleLogout = useCallback(async () => {
    try {
      if (!onLogout) {
        console.error("Logout function not available");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      onSelectServer(null, null, null, null);
      setPosts([]);
      setPage(0);

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
        Swal.fire({
          icon: "success",
          title: "성공!",
          text: "서버가 성공적으로 생성되었습니다.",
          confirmButtonText: "확인",
        });
        handleCloseModal();
        if (onRefreshServers) {
          await onRefreshServers();
        }
      }
    } catch (error) {
      console.error("서버 생성 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "서버 생성에 실패했습니다.",
        confirmButtonText: "확인",
      });
    }
  };

  const handleContextMenu = useCallback((e, server) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      serverId: server.id,
      serverEmail: server.email,
    });
  }, []);

  const handleDeleteServer = async (serverId) => {
    try {
      const result = await Swal.fire({
        title: "정말 삭제하시겠습니까?",
        text: "이 작업은 되돌릴 수 없습니다!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
      });

      if (result.isConfirmed) {
        const response = await axios.delete(
          `http://localhost:8181/server/servers?id=${serverId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "삭제 완료!",
            text: "서버가 성공적으로 삭제되었습니다.",
            confirmButtonText: "확인",
          });
          onSelectServer(null);
          setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
          if (onRefreshServers) {
            await onRefreshServers();
          }
          return;
        }
      }
    } catch (error) {
      console.error("서버 삭제 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "서버 삭제에 실패했습니다.",
        confirmButtonText: "확인",
      });
    }
    setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
  };

  const handleLeaveServer = async (serverId) => {
    try {
      const result = await Swal.fire({
        title: "서버를 탈퇴하시겠습니까?",
        text: "정말 이 서버를 탈퇴하시겠습니까?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "탈퇴",
        cancelButtonText: "취소",
      });

      if (result.isConfirmed) {
        const response = await axios.delete(
          `http://localhost:8181/server/serverList?id=${serverId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "탈퇴 완료!",
            text: "서버에서 성공적으로 탈퇴했습니다.",
            confirmButtonText: "확인",
          });
          onSelectServer(null);
          setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
          if (onRefreshServers) {
            await onRefreshServers();
          }
          return;
        }
      }
    } catch (error) {
      console.error("서버 탈퇴 실패:", error);
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "서버 탈퇴에 실패했습니다.",
        confirmButtonText: "확인",
      });
    }
    setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
  };

  return {
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
  };
};
