import React, { useState } from "react";
import "./DirectMessage.css";
import FriendList from "./FriendList.js";
import ServerInviteList from "./ServerInviteList.js";
import { FaUserFriends } from "react-icons/fa";

const DirectMessage = ({ onSelectChannel, getServerList }) => {
  const [showFriends, setShowFriends] = useState(false);

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

      <div>
        <FriendList onSelectChannel={onSelectChannel} />
        <ServerInviteList getServerList={getServerList} />
      </div>
    </div>
  );
};

export default DirectMessage;
