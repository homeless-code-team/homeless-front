import React from "react";
import "./ChatRoomList.css";

const ChatRoomList = ({
  serverId,
  serverName,
  onSelectChannel,
  selectedChannel,
  channels,
}) => {
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
      {channels.map((channel) => (
        <div
          key={channel.id}
          className={`channel-item ${
            selectedChannel === channel.id ? "selected" : ""
          }`}
          onClick={() => onSelectChannel(channel.id, channel.name)}
        >
          {channel.name}
        </div>
      ))}
    </div>
  );
};

export default ChatRoomList;
