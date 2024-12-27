import React, { useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import MenuBar from "./components/MenuBar.js";
import ServerList from "./components/ServerList.js";
import ChatRoomList from "./components/ChatRoomList.js";
import ChatRoom from "./components/ChatRoom.js";
import SignIn from "./components/SignIn.js";
import SignUp from "./components/SignUp.js";
import AuthContext from "./context/AuthContext.js";
import DirectMessage from "./components/DirectMessage.js";

// ProtectedRoute Component
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return element;
};

function App() {
  const { isAuthenticated } = useContext(AuthContext);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [serverName, setServerName] = useState(null);
  const [isDMOpen, setIsDMOpen] = useState(false);

  // 서버별 채널 목록 정의
  const servers = [
    {
      id: 1,
      name: "일반 서버",
      channels: [
        { id: 1, name: "일반" },
        { id: 2, name: "공지사항" },
        { id: 3, name: "잡담" },
      ],
    },
    {
      id: 2,
      name: "게임 서버",
      channels: [
        { id: 4, name: "게임공략" },
        { id: 5, name: "팀찾기" },
        { id: 6, name: "거래" },
      ],
    },
    {
      id: 3,
      name: "음악 서버",
      channels: [
        { id: 7, name: "음악추천" },
        { id: 8, name: "작곡" },
        { id: 9, name: "콘서트" },
      ],
    },
  ];

  const handleSelectServer = (serverId, name) => {
    const server = servers.find((s) => s.id === serverId);
    setSelectedServer(serverId);
    setServerName(name);
    setIsDMOpen(false);
    if (server && server.channels.length > 0) {
      setSelectedChannel({
        id: server.channels[0].id,
        name: server.channels[0].name,
      });
    }
  };

  const handleSelectChannel = (channelId, channelName) => {
    setSelectedChannel({
      id: channelId,
      name: channelName,
    });
  };

  const onOpenDM = () => {
    console.log("Direct Message opened");
    setIsDMOpen(true);
  };

  // 현재 선택된 서버의 채널 목록 가져오기
  const currentServerChannels =
    servers.find((s) => s.id === selectedServer)?.channels || [];

  return (
    <div className="app-container">
      <MenuBar />
      <Routes>
        {/* 인증되지 않은 사용자 전용 */}
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </>
        ) : (
          <>
            {/* 인증된 사용자 전용 */}
            <Route
              path="/"
              element={
                <>
                  <ServerList
                    servers={servers}
                    onSelectServer={handleSelectServer}
                    selectedServer={selectedServer}
                    onOpenDM={onOpenDM}
                  />
                  <div className="app-content">
                    <div className="content-wrapper">
                      {isDMOpen ? (
                        <DirectMessage onSelectChannel={handleSelectChannel} />
                      ) : (
                        <ChatRoomList
                          serverId={selectedServer}
                          serverName={serverName}
                          onSelectChannel={handleSelectChannel}
                          selectedChannel={selectedChannel?.id}
                          channels={currentServerChannels}
                        />
                      )}
                      <div className="main-content">
                        <ChatRoom
                          serverId={selectedServer}
                          channelId={selectedChannel?.id}
                          channelName={selectedChannel?.name}
                          isDirectMessage={isDMOpen}
                        />
                      </div>
                    </div>
                  </div>
                </>
              }
            />
          </>
        )}

        {/* 예외 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
