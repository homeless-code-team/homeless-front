import React, { useState, useEffect } from "react";
import "./ChatRoomList.css";
import axios from "axios";
import Swal from "sweetalert2";
import { ImEllo } from "react-icons/im";
import axiosInstance from "../configs/axios-config";

const ChatRoomList = ({
  serverId,
  serverName,
  onSelectChannel,
  selectedChannel,
  channels,
  onCreateChannel,
  handleSelectServer,
  serverRole,
  serverTag,
  boardList,
  handleSelectBoard,
  selectedBoard,
  serverType,
  setShowMemberModal,
  showMemberModal,
  getServerList,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [editChannelName, setEditChannelName] = useState("");
  const [editChannelId, setEditChannelId] = useState(null);
  const [isBoardListCollapsed, setIsBoardListCollapsed] = useState(false);
  const [isChannelListCollapsed, setIsChannelListCollapsed] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardTag, setNewBoardTag] = useState("");
  const [editBaordId, setEditBoardId] = useState("");
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [showBoardEditModal, setShowBoardEditModal] = useState(false);
  const [editBoardTag, setEditBoardTag] = useState("");
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu && !event.target.closest(".role-box")) {
        setContextMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);

  // 채널 생성 핸들러
  const handleCreateChannel = async () => {
    if (serverRole !== "OWNER" && serverRole !== "MANAGER") {
      Swal.fire("권한 없음", "채널 생성 권한이 없습니다.", "error");
      return;
    }

    if (newChannelName.trim()) {
      const data = new FormData();
      data.append("name", newChannelName);
      data.append("serverId", serverId);

      try {
        const res = await axiosInstance.post(
          "http://localhost:8181/server/channels",
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          setShowModal(false);
          setNewChannelName("");
          await handleSelectServer(
            serverId,
            serverName,
            serverRole,
            serverTag,
            serverType
          );
        }
      } catch (error) {
        getServerList();
        handleSelectServer(serverId);
        console.error("채널 생성 중 오류 발생:", error);
        Swal.fire(
          "채널 생성 중 문제가 발생했습니다.",
          "권한을 다시 확인해주세요"
        );
      }
    }
  };

  //채널 수정 핸들러
  const handleEditChannel = async () => {
    if (editChannelName.trim()) {
      const data = new FormData();
      data.append("name", editChannelName);
      data.append("channelId", editChannelId);

      try {
        const res = await axiosInstance.put(
          `${process.env.REACT_APP_API_BASE_URL}/server/channels`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          setShowEditModal(false);
          setEditChannelName("");
          setEditChannelId(null);
          await handleSelectServer(
            serverId,
            serverName,
            serverRole,
            serverTag,
            serverType
          );
        }
      } catch (error) {
        getServerList();
        handleSelectServer(serverId);
        console.error("채널 수정 중 오류 발생:", error);
        Swal.fire(
          "채널 수정 중 문제가 발생했습니다.",
          "권한을 다시 확인해주세요"
        );
      }
    }
  };

  //채널 삭제 핸들러
  const handleDeleteChannel = async (channelId) => {
    try {
      const result = await Swal.fire({
        title: "채널 삭제",
        text: "정말로 이 채널을 삭제하시겠습니까?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
      });

      if (result.isConfirmed) {
        const res = await axiosInstance.delete(
          `${process.env.REACT_APP_API_BASE_URL}/server/channels?id=${channelId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.status === 200) {
          await handleSelectServer(
            serverId,
            serverName,
            serverRole,
            serverTag,
            serverType
          );
          Swal.fire(
            "삭제 완료!",
            "채널이 성공적으로 삭제되었습니다.",
            "success"
          );
        }
      }
    } catch (error) {
      getServerList();
      handleSelectServer(serverId);
      console.error("채널 삭제 중 오류 발생:", error);
      Swal.fire(
        "채널 삭제 중 문제가 발생했습니다.",
        "권한을 다시 확인해주세요"
      );
    }
  };

  // 게시판 생성 핸들러
  const handleCreateBoard = async () => {
    if (serverRole !== "OWNER" && serverRole !== "MANAGER") {
      Swal.fire("권한 없음", "게시판 생성 권한이 없습니다.", "error");
      return;
    }

    if (newBoardTitle.trim()) {
      const data = new FormData();
      data.append("boardTitle", newBoardTitle);
      data.append("serverId", serverId);
      data.append("tag", serverTag);

      try {
        const res = await axiosInstance.post(
          `${process.env.REACT_APP_API_BASE_URL}/server/boardList`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          setShowBoardModal(false);
          setNewBoardTitle("");
          await handleSelectServer(
            serverId,
            serverName,
            serverRole,
            serverTag,
            serverType
          );
        }
      } catch (error) {
        getServerList();
        handleSelectServer(serverId);
        console.log(error);

        Swal.fire(
          "게시판 생성 중 문제가 발생했습니다.",
          "권한을 다시 확인해주세요"
        );
      }
    }
  };

  // 게시판 삭제
  const handleBoardDelete = async (boardId) => {
    try {
      const result = await Swal.fire({
        title: "게시판 삭제",
        text: "정말로 이 게시판을 삭제하시겠습니까?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
      });

      if (result.isConfirmed) {
        const res = await axiosInstance.delete(
          `${process.env.REACT_APP_API_BASE_URL}/server/boardList?id=${boardId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status) {
          await handleSelectServer(
            serverId,
            serverName,
            serverRole,
            serverTag,
            serverType
          );
          setEditBoardId("");
          setEditBoardTitle("");
        }
      }
    } catch (error) {
      getServerList();
      handleSelectServer(serverId);
      console.error("게시판 삭제 중 오류 발생:", error);
      Swal.fire(
        "게시판 삭제 중 문제가 발생했습니다.",
        "권한을 다시 확인해주세요"
      );
    }
  };

  const handleBoardEdit = async () => {
    try {
      const result = await Swal.fire({
        title: "게시판 수정",
        text: "정말로 이 게시판을 수정하시겠습니까?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "수정",
        cancelButtonText: "취소",
      });

      const data = new FormData();
      data.append("boardTitle", editBoardTitle);
      data.append("id", editBaordId);
      data.append("tag", editBoardTag);
      data.append("serverId", serverId);
      if (result.isConfirmed) {
        const res = await axiosInstance.put(
          `${process.env.REACT_APP_API_BASE_URL}/server/boardList`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          await handleSelectServer(
            serverId,
            serverName,
            serverRole,
            serverTag,
            serverType
          );
          setShowBoardEditModal(false);
          setEditBoardId("");
          setEditBoardTitle("");
          setEditBoardTag("");
        }
      }
    } catch (error) {
      getServerList();
      handleSelectServer(serverId);
      console.error("게시판 수정 중 오류 발생:", error);
      Swal.fire(
        "게시판 수정 중 문제가 발생했습니다.",
        "권한을 다시 확인해주세요"
      );
    }
  };

  if (!serverId) {
    return (
      <div className="channel-list">
        <div className="channel-header">서버를 선택하세요</div>
      </div>
    );
  }

  const handleShowMembers = () => {
    fetchMembers();
    setShowMemberModal(true);
  };

  const fetchMembers = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/server/userList?id=${serverId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("asd");
      console.log(response);

      const sortedMembers = response.data.result.sort((a, b) => {
        if (a.role === b.role) return 0;
        if (a.role === "OWNER") return -1;
        if (b.role === "OWNER") return 1;
        if (a.role === "MANAGER") return -1;
        if (b.role === "MANAGER") return 1;
        return 0; // 기본적으로 GENERAL은 마지막에 위치
      });

      setMembers(sortedMembers);

      console.log(response.data);
    } catch (error) {
      console.error("서버 멤버를 불러오는데 실패했습니다:", error);
    }
  };

  const handleContextMenu = (event, email) => {
    event.preventDefault();
    const userEmail = localStorage.getItem("userEmail");
    if (serverRole === "OWNER" && email !== userEmail) {
      setSelectedMember(email);
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
      });
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      const res = await axiosInstance.put(
        `${process.env.REACT_APP_API_BASE_URL}/server/userRole`,
        {
          id: serverId,
          email: selectedMember,
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        // Update the UI or refetch members

        console.log("Asdasd");
        console.log(newRole);

        console.log("변경변경");
        fetchMembers();
        setContextMenu(null);
      }
    } catch (error) {
      console.error("역할 변경 중 오류 발생:", error);
      Swal.fire("오류 발생", "역할 변경 중 문제가 발생했습니다.", "error");
    }
  };

  const resignUser = async () => {
    try {
      const res = await axiosInstance.delete(
        `${process.env.REACT_APP_API_BASE_URL}/server/resign`,
        {
          data: {
            serverId: serverId,
            email: selectedMember,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        // Update the UI or refetch members

        fetchMembers();
        setContextMenu(null);
      }
    } catch (error) {
      console.error("유저 삭제 중 오류 발생:", error);
      Swal.fire("오류 발생", "유저 삭제 중 문제가 발생했습니다.", "error");
    }
  };

  return (
    <div className="channel-list">
      <div className="channel-header">{serverName || "채널 목록"}</div>
      <span className="server-tag">{serverTag}</span>

      {serverType !== 0 && (
        <div className="member-btn-div">
          <button className="member-list-btn" onClick={handleShowMembers}>
            멤버 리스트
          </button>
        </div>
      )}
      <div
        className="divider"
        onClick={() => setIsBoardListCollapsed(!isBoardListCollapsed)}
        style={{ cursor: "pointer" }}
      >
        <small style={{ color: isBoardListCollapsed ? "#808080" : "white" }}>
          {isBoardListCollapsed ? ">" : "∨"} 게시판
        </small>
      </div>
      {!isBoardListCollapsed && (
        <>
          {(serverRole === "OWNER" || serverRole === "MANAGER") && (
            <div
              className="create-channel"
              onClick={() => setShowBoardModal(true)}
            >
              새로운 게시판 +
            </div>
          )}
          {boardList.map((board) => (
            <div
              key={board.id}
              className={`board-list ${
                selectedBoard === board.id ? "selected" : ""
              }`}
              onClick={() => handleSelectBoard(board.id, board.boardTitle)}
            >
              <div className="board-content">
                <span className="board-name">{board.boardTitle}</span>

                {selectedBoard === board.id &&
                  (serverRole === "OWNER" || serverRole === "MANAGER") && (
                    <div className="board-actions">
                      <span
                        className="channel-settings"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBoardEditModal(true);
                          setEditBoardId(board.id);
                          setEditBoardTitle(board.boardTitle);
                        }}
                      >
                        ⚙️
                      </span>
                      <span
                        className="channel-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBoardDelete(board.id);
                        }}
                      >
                        🗑️
                      </span>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </>
      )}
      <div
        className="divider"
        onClick={() => setIsChannelListCollapsed(!isChannelListCollapsed)}
        style={{ cursor: "pointer" }}
      >
        <small style={{ color: isChannelListCollapsed ? "#808080" : "white" }}>
          {isChannelListCollapsed ? ">" : "∨"} 채널
        </small>
      </div>
      {!isChannelListCollapsed && (
        <>
          {(serverRole === "OWNER" || serverRole === "MANAGER") && (
            <div className="create-channel" onClick={() => setShowModal(true)}>
              새로운 채널 +
            </div>
          )}
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`channel-item ${
                selectedChannel === channel.id ? "selected" : ""
              }`}
              onClick={() => onSelectChannel(channel.id, channel.name)}
            >
              <div className="channel-content">
                <span className="channel-name">{channel.name}</span>
                {selectedChannel === channel.id &&
                  (serverRole === "OWNER" || serverRole === "MANAGER") && (
                    <>
                      <span
                        className="channel-settings"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditModal(true);
                          setEditChannelId(channel.id);
                          setEditChannelName(channel.name);
                        }}
                      >
                        ⚙️
                      </span>
                      <span
                        className="channel-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChannel(channel.id);
                        }}
                      >
                        🗑️
                      </span>
                    </>
                  )}
              </div>
            </div>
          ))}
        </>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>새 채널 만들기</h3>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="채널 이름을 입력하세요"
            />
            <div className="modal-buttons">
              <button onClick={handleCreateChannel}>생성</button>
              <button onClick={() => setShowModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>채널 이름 수정</h3>
            <input
              type="text"
              value={editChannelName}
              onChange={(e) => setEditChannelName(e.target.value)}
              placeholder="채널 이름을 입력하세요"
            />
            <div className="modal-buttons">
              <button onClick={handleEditChannel}>수정</button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditChannelName("");
                  setEditChannelId(null);
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {showBoardModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>새 게시판 만들기</h3>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="게시판 이름을 입력하세요"
            />
            <input
              type="text"
              value={newBoardTag}
              onChange={(e) => setNewBoardTag(e.target.value)}
              placeholder="게시판의 태그를 입력하세요"
            />
            <div className="modal-buttons">
              <button onClick={handleCreateBoard}>생성</button>
              <button onClick={() => setShowBoardModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
      {showBoardEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>게시판 이름 수정</h3>
            <input
              type="text"
              value={editBoardTitle}
              onChange={(e) => setEditBoardTitle(e.target.value)}
              placeholder="게시판 이름을 입력하세요"
            />
            <input
              type="text"
              value={editBoardTag}
              onChange={(e) => setEditBoardTag(e.target.value)}
              placeholder="게시판 태그을 입력하세요"
            />
            <div className="modal-buttons">
              <button onClick={handleBoardEdit}>수정</button>
              <button
                onClick={() => {
                  setShowBoardEditModal(false);
                  setEditBoardId("");
                  setEditBoardTitle(null);
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>서버 멤버 목록</h3>

            {Object.entries(
              members.reduce((acc, member) => {
                if (!acc[member.role]) acc[member.role] = [];
                acc[member.role].push(member);
                return acc;
              }, {})
            ).map(([role, members]) => (
              <div key={role}>
                <h4>{role}</h4>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {members.map((member) => (
                    <li
                      key={member.id}
                      className="member-item"
                      onContextMenu={(e) => handleContextMenu(e, member.email)}
                    >
                      {member.profileimage ? (
                        <img src={member.profileimage} alt="업따" />
                      ) : (
                        <ImEllo />
                      )}
                      {member.nickname}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {contextMenu && (
              <ul
                className="role-box"
                style={{
                  top: contextMenu.mouseY,
                  left: contextMenu.mouseX,
                }}
              >
                <li
                  className="manager-btn"
                  onClick={() => handleRoleChange("MANAGER")}
                >
                  MANAGER
                </li>
                <br />
                <li
                  className="general-btn"
                  onClick={() => handleRoleChange("GENERAL")}
                >
                  GENERAL
                </li>
                <br />
                <li className="resign-btn" onClick={() => resignUser()}>
                  서버 추방
                </li>
              </ul>
            )}

            <div className="modal-buttons">
              <button onClick={() => setShowMemberModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomList;
