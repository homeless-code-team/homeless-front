import React from "react";
import "./ServerList.css";
import { FaUserFriends } from "react-icons/fa";

const ServerList = ({ servers, onSelectServer, selectedServer, onOpenDM }) => {
  return (
    <div className="server-list">
      <div
        className={`dm-button ${selectedServer === "dm" ? "selected" : ""}`}
        onClick={() => onOpenDM()}
      >
        <FaUserFriends size={24} />
      </div>
      <div className="server-separator"></div>
      {servers.map((server) => (
        <div
          key={server.id}
          className={`server-item ${
            selectedServer === server.id ? "selected" : ""
          }`}
          onClick={() => onSelectServer(server.id, server.name)}
        >
          {server.name.charAt(0)}
        </div>
      ))}
    </div>
  );
};

export default ServerList;
