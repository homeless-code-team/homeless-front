import React from "react";
import "./ServerList.css";

const ServerList = ({ servers, onSelectServer, selectedServer }) => {
  return (
    <div className="server-list">
      {servers.map((server) => (
        <div
          key={server.id}
          className={`server-item ${selectedServer === server.id ? "selected" : ""}`}
          onClick={() => onSelectServer(server.id, server.name)}
        >
          {server.name.charAt(0)}
        </div>
      ))}
    </div>
  );
};

export default ServerList;
