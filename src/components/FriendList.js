import React from "react";
import "./FriendList.css";

const FriendList = ({ onSelectChannel }) => {
  const friends = [
    { id: 11, name: "친구1", status: "online" },
    { id: 22, name: "친구2", status: "offline" },
    { id: 33, name: "친구3", status: "online" },
  ];

  return (
    <div className="friend-list-container">
      <div className="friend-list-header">
        <h3>친구 목록</h3>
        <div className="friend-count">
          온라인 - {friends.filter((f) => f.status === "online").length}
        </div>
      </div>
      <div className="friend-list">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="friend-item"
            onClick={() => onSelectChannel(friend.id, friend.name)}
          >
            <div className="friend-avatar">
              {friend.name.charAt(0).toUpperCase()}
            </div>
            <div className="friend-info">
              <span className="friend-name">{friend.name}</span>
              <span className={`friend-status ${friend.status}`}>
                {friend.status === "online" ? "온라인" : "오프라인"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;
