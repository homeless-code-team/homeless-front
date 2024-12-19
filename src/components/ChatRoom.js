import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatRoom.css";

const ChatRoom = ({ serverId, channelName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageListRef = useRef(null);
  const socketRef = useRef(null);

  const channelId = 1; // 고정된 채널 ID (테스트용)

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

  // WebSocket 연결 및 메시지 수신
  const connectWebSocket = () => {
    const socketUrl = `ws://localhost:8181/chat/rooms/${channelId}/send`; // 서버와 동일한 경로로 수정

    // WebSocket 연결
    socketRef.current = new WebSocket(socketUrl);

    // WebSocket 메시지 수신
    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // WebSocket 연결 종료 시 처리
    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // WebSocket 에러 처리
    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // WebSocket 연결 상태가 열린 상태에서만 메시지 전송
    socketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };
  };

  // WebSocket 재연결 로직 (WebSocket이 닫혔을 때)
  const reconnectWebSocket = () => {
    console.log("Reconnecting WebSocket...");
    socketRef.current.close(); // 기존 연결 종료
    connectWebSocket(); // 새로운 연결 시도
  };

  // WebSocket 연결
  useEffect(() => {
    connectWebSocket();

    // WebSocket 연결 종료 시 처리
    return () => {
      socketRef.current.close();
    };
  }, [channelId]);

  // 메시지 전송 핸들러 (백엔드 API를 통한 메시지 전송)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        from: "나", // 실제 사용자 정보로 바꿔주세요
        text: newMessage.trim(),
        roomId: channelId, // 고정된 채널 ID
      };

      try {
        // 백엔드 API로 메시지 전송
        await axios.post(
          `http://localhost:8181/api/chat/rooms/${channelId}/send`, // 서버와 일치하도록 URL 수정
          message
        );

        // WebSocket이 열려 있을 때만 메시지 전송
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(JSON.stringify(message)); // WebSocket으로 메시지 전송
        } else {
          console.warn("WebSocket is not open. Retrying...");
          reconnectWebSocket(); // WebSocket이 닫혔을 때 재연결 시도
        }

        setNewMessage(""); // 입력창 초기화
        inputRef.current?.focus(); // 메시지 전송 후 입력창 포커스 유지
      } catch (error) {
        console.error("Error sending message:", error);
      }
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
          <div className="chat-header">
            <h3>{channelName}</h3>
            <div className="header-divider"></div>
            <p className="channel-description">
              {channelName} 채널에 오신 것을 환영합니다
            </p>
          </div>
          <div className="chat-messages-container">
            <div className="message-list" ref={messageListRef}>
              {messages.map((message, index) => (
                <div key={index} className="message-item">
                  <div className="message-header">
                    <span className="message-sender">{message.from}</span>
                    <span className="message-time">
                      {new Date().toLocaleTimeString()}
                    </span>
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
