import React from "react";
import "./DirectMessage.css";

const DirectMessage = ({ onSelectChannel }) => {
  const users = [
    { id: 1, name: "사용자1" },
    { id: 2, name: "사용자2" },
    { id: 3, name: "사용자3" },
  ];

  return (
    <div className="direct-message-container">
      <h2>Direct Message</h2>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} onClick={() => onSelectChannel(user.id, user.name)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DirectMessage;
