import React, { useState, useContext, useEffect } from "react";
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
import Profile from "./components/Profile.js";
import axios from "axios";

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
  const [serverList, setServerList] = useState([]);
  const [channelList, setChannelList] = useState([]);
  // 서버별 채널 목록 정의

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isAuthenticated && token) {
      getServerList();
    }
  }, [isAuthenticated]); // isAuthenticated가 변경될 때마다 실행

  const getServerList = async () => {
    const res = await axios.get("http://localhost:8181/server/servers", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("res : ", res.data.result);
    setServerList(res.data.result);
  };

  const handleSelectServer = async (serverId, title) => {
    const server = serverList.find((s) => s.id === serverId);
    setSelectedServer(serverId);
    setServerName(title);
    setIsDMOpen(false);

    const res = await axios.get(
      `http://localhost:8181/server/channels?id=${serverId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.data.result.length > 0) {
      setChannelList(res.data.result);
    } else {
      setChannelList([]);
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

  return (
    <div className="app-container">
      <MenuBar />
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute
                  element={
                    <>
                      <ServerList
                        serverList={serverList}
                        onSelectServer={handleSelectServer}
                        selectedServer={selectedServer}
                        onOpenDM={onOpenDM}
                        onRefreshServers={getServerList} // 서버 목록을 가져오는 함수
                      />
                      <div className="app-content">
                        <div className="content-wrapper">
                          {isDMOpen ? (
                            <DirectMessage
                              onSelectChannel={handleSelectChannel}
                            />
                          ) : (
                            <ChatRoomList
                              serverId={selectedServer}
                              serverName={serverName}
                              onSelectChannel={handleSelectChannel}
                              selectedChannel={selectedChannel?.id}
                              channels={channelList}
                              handleSelectServer={handleSelectServer}
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
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  element={
                    <div className="full-page">
                      <Profile />
                    </div>
                  }
                />
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
