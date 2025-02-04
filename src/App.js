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
import Board from "./components/Board.js";

function App() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
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
  const [serverType, setServerType] = useState(""); //ok

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const handleBeforeUnload = async () => {
      console.log("창이 닫히기 전에 로그아웃 처리");
      if (isLoggedIn) {
        await window.electronAPI.logout(); // Electron API를 통해 로그아웃 호출
        setIsLoggedIn(false); // 로그아웃 상태로 설정
      }
    };

    // 창 닫기 이벤트 등록
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // 이벤트 정리
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoggedIn, setIsLoggedIn]);

  // 로그인 상태가 변경될 때 초기화
  useEffect(() => {
    // ok
    if (isLoggedIn) {
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
  }, [isLoggedIn]);

  useEffect(() => {
    //
    const token = localStorage.getItem("token");
    if (isLoggedIn && token) {
      console.log("ASdasdasdasd");
      getServerList();
    }
  }, [isLoggedIn]);

  const getServerList = async () => {
    // ok
    const token = localStorage.getItem("token");
    if (!isLoggedIn || !token) {
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
    // ok
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
    // ok
    setSelectedChannel({
      id: channelId,
      name: channelName,
    });
    setSelectedBoard(null);
  };

  const handleSelectBoard = (boardId, boardTitle) => {
    // ok
    setSelectedBoard({
      id: boardId,
      boardTitle: boardTitle,
    });
    setSelectedChannel(null);
    setPosts([]);
    setPage(0);
    setSearchValue("");
  };

  const handleEnterPostChat = (postId, postTitle) => {
    // ok
    setSelectedChannel({
      id: postId,
      name: postTitle,
    });
    setSelectedBoard(null);
  };

  const onOpenDM = () => {
    // ok
    console.log("Direct Message opened");
    setIsDMOpen(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <MenuBar />
        <SignIn onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <MenuBar />
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
    </div>
  );
}

export default App;
