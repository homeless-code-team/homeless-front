import React, { useState, useRef, useEffect } from "react";
import "./ChatRoom.css";

const ChatRoom = ({ serverId, channelId, channelName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageListRef = useRef(null);

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    if (messageListRef.current) {
      const { scrollHeight, clientHeight } = messageListRef.current;
      messageListRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  // 새 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 채널이 변경될 때마다 입력창 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, [channelId]);

  // 메시지 전송 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: "나",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      // 메시지 전송 후 입력창 포커스 유지
      inputRef.current?.focus();
    }
  };

  // 키 입력 핸들러
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-room-container">
      {channelId ? (
        <>
          <div className="chat-messages-container">
            <div className="message-list" ref={messageListRef}>
              {messages.map((message) => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <span className="message-sender">{message.sender}</span>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                  <div className="message-content">{message.text}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chat-input-container">
            <button className="add-content-button">
              <span className="plus-icon">+</span>
            </button>
            <form onSubmit={handleSubmit} className="chat-form">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`#${channelName}에 메시지 보내기`}
                className="chat-input"
              />
            </form>
          </div>
        </>
      ) : (
        <div className="no-messages">채널을 선택해주세요</div>
      )}
    </div>
  );
};

export default ChatRoom;
