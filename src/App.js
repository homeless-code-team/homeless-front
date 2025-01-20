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

import OAuthRedirectHandler from "./components/OAuthRedirectHandler.js";
import PasswordModal from "./components/PasswordModal.js";
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
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
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
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [serverType, setServerType] = useState("");

  // 로그인 상태가 변경될 때 초기화
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedServer(null);
      setSelectedChannel(null);
      setServerName(null);
      setIsDMOpen(false);
      setServerRole(null);
      setServerTag(null);
      setBoardList([]);
      setSelectedBoard(null);
      setPosts([]);
      setPage(0);
    }
  }, [isAuthenticated]);

  // 서버별 채널 목록 정의
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isAuthenticated && token) {
      getServerList();
    }
  }, [isAuthenticated]);

  const getServerList = async () => {
    const token = localStorage.getItem("token");
    if (!isAuthenticated && !token) {
      return;
    }
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/server/servers`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log("asdasd");

    console.log("res =====================: ", res);
    setServerList(res.data.result);
  };

  const handleSelectServer = async (
    serverId,
    title,
    userRole,
    serverTag,
    serverType
  ) => {
    const token = localStorage.getItem("token");
    getServerList();
    if (serverId) {
      setSelectedServer(serverId);
      console.log("asdad", title);

      setServerName(title);
      setIsDMOpen(false);
      setServerRole(userRole);
      setServerTag(serverTag);
      setServerType(serverType);
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
    setPosts([]);
    setPage(0);
    setSearchValue("");
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
            <Route path="/oauth2/redirect" element={<OAuthRedirectHandler />} />
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
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
                        onRefreshServers={getServerList}
                        setPosts={setPosts}
                        setPage={setPage}
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
                              serverType={serverType}
                              setShowMemberModal={setShowModal}
                              showMemberModal={showModal}
                              getServerList={getServerList}
                            />
                          )}
                          <div className="main-content">
                            {selectedBoard ? (
                              <Board
                                serverId={selectedServer}
                                boardId={selectedBoard?.id}
                                boardTitle={selectedBoard?.boardTitle}
                                posts={posts}
                                setPosts={setPosts}
                                page={page}
                                setPage={setPage}
                                searchValue={searchValue}
                                setSearchValue={setSearchValue}
                                handleSelectBoard={onSelectBoard}
                                getServerList={getServerList}
                                handleSelectServer={handleSelectServer}
                                serverName={serverName}
                                serverRole={serverRole}
                                serverTag={serverTag}
                                serverType={serverType}
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
