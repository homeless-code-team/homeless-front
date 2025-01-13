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
import Board from "./components/Board.js";

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
  const [serverRole, setServerRole] = useState(null);
  const [serverTag, setServerTag] = useState(null);
  const [boardList, setBoardList] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [userList, setUserList] = useState([]);

  // 서버별 채널 목록 정의
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isAuthenticated && token) {
      getServerList(0, 11);
    }
  }, [isAuthenticated]); // isAuthenticated가 변경될 때마다 실행

  const getServerList = async (page, size) => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/server/servers?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("res =====================: ", res);
    setServerList(res.data.result);
  };

  const handleSelectServer = async (serverId, title, userRole, serverTag) => {
    const token = localStorage.getItem("token");
    if (serverId) {
      setSelectedServer(serverId);
      setServerName(title);
      setIsDMOpen(false);
      setServerRole(userRole);
      setServerTag(serverTag);
      setSelectedBoard(null);
      setSelectedChannel(null);

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/server/channels?id=${serverId}`,
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
    } else {
      setSelectedServer(null);
      setServerName(null);
      setIsDMOpen(null);
      setServerRole(null);
    }

    // boardList 가져오기
    if (token) {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/server/boardList?id=${serverId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(res.data.result);
      setBoardList(res.data.result);
    }
  };

  const handleSelectChannel = (channelId, channelName) => {
    setSelectedChannel({
      id: channelId,
      name: channelName,
    });
    setSelectedBoard(null);
  };

  const onSelectBoard = (boardId, boardTitle) => {
    setSelectedBoard({
      id: boardId,
      boardTitle: boardTitle,
    });

    setSelectedChannel(null);
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
                        setServerList={setServerList}
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
                              serverRole={serverRole}
                              serverTag={serverTag}
                              boardList={boardList}
                              handleSelectBoard={onSelectBoard}
                              selectedBoard={selectedBoard?.id}
                            />
                          )}
                          <div className="main-content">
                            {selectedBoard ? (
                              <Board
                                serverId={selectedServer}
                                boardId={selectedBoard?.id}
                                boardTitle={selectedBoard?.boardTitle}
                              />
                            ) : (
                              <ChatRoom
                                serverId={selectedServer}
                                channelId={selectedChannel?.id}
                                channelName={selectedChannel?.name}
                                isDirectMessage={isDMOpen}
                                serverRole={serverRole}
                              />
                            )}
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
