import React, { useState, useEffect } from "react";
import "./DirectMessage.css";
import FriendList from "./FriendList.js";
import ServerInviteList from "./ServerInviteList.js";
import { FaUserFriends } from "react-icons/fa";

const DirectMessage = ({ onSelectChannel, getServerList }) => {
  const [showFriends, setShowFriends] = useState(false);
  const users = [
    { id: 1, name: "사용자1" },
    { id: 2, name: "사용자2" },
    { id: 3, name: "사용자3" },
  ];

  return (
    <div className="direct-message-container">
      <div className="dm-header">
        <button
          className="friend-list-button"
          onClick={() => setShowFriends(!showFriends)}
        >
          <FaUserFriends size={20} />
          <span>친구</span>
        </button>
      </div>

      {showFriends ? (
        <div>
          <FriendList onSelectChannel={onSelectChannel} />
          <ServerInviteList getServerList={getServerList} />
        </div>
      ) : (
        <>
          <h2 className="dm-title">다이렉트 메시지임다</h2>
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} onClick={() => onSelectChannel(0, user.name)}>
                {user.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default DirectMessage;
