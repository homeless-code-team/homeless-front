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
import Callback from "./components/Callback.js";
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
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [currentView, setCurrentView] = useState("chatRoom");

  // 창 닫힐 때 로그아웃 처리
  useEffect(() => {
    const handleBeforeUnload = async () => {
      console.log("창이 닫히기 전에 로그아웃 처리");
      if (isAuthenticated) {
        await window.electronAPI.logout(); // Electron API를 통해 로그아웃 호출
        setIsAuthenticated(false); // 로그아웃 상태로 설정
      }
    };

    // 창 닫기 이벤트 등록
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // 이벤트 정리
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated, setIsAuthenticated]);

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
      console.log("ASdasdasdasd");

      getServerList();
    }
  }, [isAuthenticated]);

  const getServerList = async () => {
    const token = localStorage.getItem("token");
    if (!isAuthenticated || !token) {
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

  const handleSelectBoard = (boardId, boardTitle) => {
    setSelectedBoard({
      id: boardId,
      boardTitle: boardTitle,
    });
    setSelectedChannel(null);
    setPosts([]);
    setPage(0);
    setSearchValue("");
  };

  // 게시글 채팅방 입장을 위한 새로운 함수 추가
  const handleEnterPostChat = (postId, postTitle) => {
    setSelectedChannel({
      id: postId,
      name: postTitle,
    });
    setSelectedBoard(null);
  };

  const onOpenDM = () => {
    console.log("Direct Message opened");
    setIsDMOpen(true);
  };

  return (
    <div className="app-container">
      <MenuBar />
      <Routes>
        <Route
          path="/user-service/login/oauth2/code/:provider"
          element={<Callback />}
        />

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
                        onRefreshServers={getServerList}
                        setPosts={setPosts}
                        setPage={setPage}
                      />
                      <div className="app-content">
                        <div className="content-wrapper">
                          {isDMOpen ? (
                            <DirectMessage
                              onSelectChannel={handleSelectChannel}
                              getServerList={getServerList}
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
                              handleSelectBoard={handleSelectBoard}
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
                                handleSelectBoard={handleSelectBoard}
                                handleEnterPostChat={handleEnterPostChat}
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
