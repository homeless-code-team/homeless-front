import React, { useState } from "react";
import ServerList from "./components/ServerList.js";
import ChatRoomList from "./components/ChatRoomList.js";
import ChatRoom from "./components/ChatRoom.js";
import SignIn from "./components/SignIn.js";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSelectServer = (serverId) => {
    setSelectedServer(serverId);
    setSelectedChannel(null);
  };

  const handleSelectChannel = (channelId, channelName) => {
    setSelectedChannel({
      id: channelId,
      name: channelName,
    });
  };

  if (!isLoggedIn) {
    return <SignIn onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <ServerList
        onSelectServer={handleSelectServer}
        selectedServer={selectedServer}
      />
      <ChatRoomList
        serverId={selectedServer}
        onSelectChannel={handleSelectChannel}
        selectedChannel={selectedChannel?.id}
      />
      <div className="main-content">
        <ChatRoom
          serverId={selectedServer}
          channelId={selectedChannel?.id}
          channelName={selectedChannel?.name}
        />
      </div>
    </div>
  );
}

export default App;
