import React, { useState } from "react";
import ServerList from "./components/ServerList.js";
import ChatRoomList from "./components/ChatRoomList.js";
import ChatRoom from "./components/ChatRoom.js";
import SignIn from "./components/SignIn.js";
import MenuBar from "./components/MenuBar.js";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [serverName, setServerName] = useState(null);

  const channels = [
    { id: 1, name: "일반" },
    { id: 2, name: "게임" },
    { id: 3, name: "음악" },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSelectServer = (serverId, name) => {
    setSelectedServer(serverId);
    setServerName(name);
    setSelectedChannel({
      id: 1,
      name: "일반"
    });
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

  return (
    <div className="app-container">
      <MenuBar />
      <ServerList
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
            channels={channels}
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
