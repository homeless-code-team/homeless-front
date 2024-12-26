import React, { useState, useEffect, useContext } from "react";
import "./DirectMessage.css";
import AuthContext from "../context/AuthContext";

const DirectMessage = () => {
  const { userName } = useContext(AuthContext);
  const [dmList, setDmList] = useState([
    { id: 1, name: "사용자1", lastMessage: "안녕하세요!" },
    { id: 2, name: "사용자2", lastMessage: "프로젝트 진행상황 어떠신가요?" },
    { id: 3, name: "사용자3", lastMessage: "회의 시간 조율해주세요." },
  ]);

  return (
    <div className="dm-container">
      <div className="dm-header">
        <h3>다이렉트 메시지</h3>
      </div>
      <div className="dm-list">
        {dmList.map((dm) => (
          <div key={dm.id} className="dm-item">
            <div className="dm-avatar">{dm.name.charAt(0)}</div>
            <div className="dm-content">
              <div className="dm-name">{dm.name}</div>
              <div className="dm-last-message">{dm.lastMessage}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectMessage;
