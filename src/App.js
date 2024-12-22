import React, { useState } from "react";
import "./App.css";
import MenuBar from "./components/MenuBar.js";
import ServerList from "./components/ServerList.js";
import ChatRoomList from "./components/ChatRoomList.js";
import ChatRoom from "./components/ChatRoom.js";
import SignIn from "./components/SignIn.js";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [serverName, setServerName] = useState(null);

  // 서버별 채널 목록 정의
  const servers = [
    { 
      id: 1, 
      name: "일반 서버",
      channels: [
        { id: 1, name: "일반" },
        { id: 2, name: "공지사항" },
        { id: 3, name: "잡담" }
      ]
    },
    { 
      id: 2, 
      name: "게임 서버",
      channels: [
        { id: 4, name: "게임공략" },
        { id: 5, name: "팀찾기" },
        { id: 6, name: "거래" }
      ]
    },
    { 
      id: 3, 
      name: "음악 서버",
      channels: [
        { id: 7, name: "음악추천" },
        { id: 8, name: "작곡" },
        { id: 9, name: "콘서트" }
      ]
    }
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSelectServer = (serverId, name) => {
    const server = servers.find(s => s.id === serverId);
    setSelectedServer(serverId);
    setServerName(name);
    if (server && server.channels.length > 0) {
      setSelectedChannel({
        id: server.channels[0].id,
        name: server.channels[0].name
      });
    }
  };

  const handleSelectChannel = (channelId, channelName) => {
    setSelectedChannel({
      id: channelId,
      name: channelName,
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <MenuBar />
        <SignIn onLogin={handleLogin} />
      </div>
    );
  }

  // 현재 선택된 서버의 채널 목록 가져오기
  const currentServerChannels = servers.find(s => s.id === selectedServer)?.channels || [];

  return (
    <div className="app-container">
      <MenuBar />
      <ServerList
        servers={servers}
        onSelectServer={handleSelectServer}
        selectedServer={selectedServer}
      />
      <div className="app-content">
        <div className="content-wrapper">
          <ChatRoomList
            serverId={selectedServer}
            serverName={serverName}
            onSelectChannel={handleSelectChannel}
            selectedChannel={selectedChannel?.id}
            channels={currentServerChannels}
          />
          <div className="main-content">
            <ChatRoom
              serverId={selectedServer}
              channelId={selectedChannel?.id}
              channelName={selectedChannel?.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
