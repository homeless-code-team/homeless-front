import React, { useState } from "react";
import "./ChatRoomList.css";
import axios from "axios";

const ChatRoomList = ({
  serverId,
  serverName,
  onSelectChannel,
  selectedChannel,
  channels,
  onCreateChannel,
  handleSelectServer,
  serverOwner,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [editChannelName, setEditChannelName] = useState("");
  const [editChannelId, setEditChannelId] = useState(null);

  const userId = localStorage.getItem("email");

  const handleCreateChannel = async () => {
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
          await handleSelectServer(serverId, serverName, userId);
        }
      } catch (error) {
        console.error("채널 생성 중 오류 발생:", error);
      }
    }
  };

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
          await handleSelectServer(serverId, serverName, userId);
        }
      } catch (error) {
        console.error("채널 수정 중 오류 발생:", error);
      }
    }
  };

  const handleDeleteChannel = async (channelId) => {
    try {
      const res = await axios.delete(
        `http://localhost:8181/server/channels?id=${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await handleSelectServer(serverId, serverName, userId);
      }
    } catch (error) {
      console.error("채널 삭제 중 오류 발생:", error);
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
      <div className="create-channel" onClick={() => setShowModal(true)}>
        새로운 채널 +
      </div>
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
            {selectedChannel === channel.id && serverOwner === userId && (
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
                    if (window.confirm("정말로 이 채널을 삭제하시겠습니까?")) {
                      handleDeleteChannel(channel.id);
                    }
                  }}
                >
                  🗑️
                </span>
              </>
            )}
          </div>
        </div>
      ))}

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
    </div>
  );
};

export default ChatRoomList;
