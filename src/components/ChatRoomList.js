import React, { useState } from "react";
import "./ChatRoomList.css";
import axios from "axios";
import Swal from "sweetalert2";

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

  const userEmail = localStorage.getItem("userEmail");

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
        const res = await axios.post(
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
          await handleSelectServer(serverId, serverName, serverRole, serverTag);
        }
      } catch (error) {
        console.error("채널 생성 중 오류 발생:", error);
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
        const res = await axios.put(
          `http://localhost:8181/server/channels`,
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
          await handleSelectServer(serverId, serverName, serverRole, serverTag);
        }
      } catch (error) {
        console.error("채널 수정 중 오류 발생:", error);
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
        const res = await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/server/channels?id=${channelId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.status === 200) {
          await handleSelectServer(serverId, serverName, serverRole, serverTag);
          Swal.fire(
            "삭제 완료!",
            "채널이 성공적으로 삭제되었습니다.",
            "success"
          );
        }
      }
    } catch (error) {
      console.error("채널 삭제 중 오류 발생:", error);
      Swal.fire("오류 발생", "채널 삭제 중 문제가 발생했습니다.", "error");
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
        const res = await axios.post(
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
          await handleSelectServer(serverId, serverName, serverRole, serverTag);
        }
      } catch (error) {
        console.error("게시판 생성 중 오류 발생:", error);
        Swal.fire("오류 발생", "게시판 생성 중 문제가 발생했습니다.", "error");
      }
    }
  };

  // 게시판 삭제
  const handleBoardDelete = async (boardId) => {
    console.log("d2d2d2d22d2d", boardId);

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
        const res = await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/server/boardList?id=${boardId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status) {
          await handleSelectServer(serverId, serverName, serverRole, serverTag);
          setEditBoardId("");
          setEditBoardTitle("");
        }
      }
    } catch (error) {
      console.error("게시판 생성 중 오류 발생:", error);
      Swal.fire("오류 발생", "게시판 삭제 중 문제가 발생했습니다.", "error");
    }
  };

  if (!serverId) {
    return (
      <div className="channel-list">
        <div className="channel-header">서버를 선택하세요</div>
      </div>
    );
  }

  return (
    <div className="channel-list">
      <div className="channel-header">{serverName || "채널 목록"}</div>
      <span className="server-tag">{serverTag}</span>
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
                    <>
                      <span
                        className="channel-settings"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditModal(true);
                          setEditBoardId(board.id);
                          setEditBoardTitle(board.name);
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
                    </>
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
    </div>
  );
};

export default ChatRoomList;
