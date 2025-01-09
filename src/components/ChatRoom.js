import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import "./ChatRoom.css";
import AuthContext from "../context/AuthContext.js";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ChatRoom = ({ serverId, channelName, channelId, isDirectMessage }) => {
  const { userName, userId } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  // 스크롤 처리
  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  // 메시지 수신 처리
  const handleMessageReceived = useCallback(
    (message) => {
      const messageWithTime = {
        id: message.id,
        text: message.content,
        from: message.senderName,
        type: message.type,
        timestamp: new Date().toLocaleString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => [...prev, messageWithTime]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  // 채팅 기록 불러오기
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/${serverId}/${channelId}/messages`
      );

      if (!response.ok) {
        throw new Error("채팅 기록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      console.log("받은 채팅 기록:", data);

      if (data.status === "OK") {
        const messages = data.data || [];
        setMessages(
          messages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            from: msg.senderName || "Unknown",
            type: msg.type,
            timestamp: new Date(msg.timestamp).toLocaleString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }),
          }))
        );
      }
      scrollToBottom();
    } catch (error) {
      console.error("채팅 기록 로딩 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }, [serverId, channelId, scrollToBottom]);

  // WebSocket 연결 설정
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !channelId) return;

    const socket = new SockJS(
      `${process.env.REACT_APP_API_BASE_URL}/chat-service/ws`
    );
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      brokerURL: `${process.env.REACT_APP_API_BASE_URL}/chat-service/ws`,
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log("WebSocket 연결 성공!");

      // 채팅방 구독 (RabbitMQ의 topic exchange 사용)
      client.subscribe(`/topic/chats.ch.${channelId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        handleMessageReceived(receivedMessage);
      });

      // 입장 메시지 전송
      client.publish({
        destination: "/pub/chats.ch.enter",
        body: JSON.stringify({
          roomId: channelId,
          senderId: userId,
          senderName: userName,
          type: "ENTER",
        }),
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      console.log("WebSocket 연결 해제!");
    };

    client.onStompError = (frame) => {
      console.error("STOMP 에러:", frame);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client.connected) {
        // 퇴장 메시지 전송
        client.publish({
          destination: "/pub/chats.ch.leave",
          body: JSON.stringify({
            roomId: channelId,
            senderId: userId,
            senderName: userName,
            type: "LEAVE",
          }),
        });
        client.deactivate();
      }
    };
  }, [channelId, userId, userName, handleMessageReceived]);

  // 채널 변경 시 채팅 기록 로드
  useEffect(() => {
    if (channelId) {
      fetchChatHistory();
      setMessages([]); // 채널 변경시 메시지 초기화
    }
  }, [channelId, fetchChatHistory]);

  // 메시지 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient || !isConnected) return;

    stompClient.publish({
      destination: "/pub/chats.ch.message",
      body: JSON.stringify({
        roomId: channelId,
        senderId: userId,
        senderName: userName,
        content: newMessage.trim(),
        type: "TALK",
      }),
    });

    setNewMessage("");
    inputRef.current?.focus();
  };

  // 엔터키 처리
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
          {!isDirectMessage && (
            <div className="chat-header">
              <h3>{channelName}</h3>
              <div className="header-divider"></div>
              <p className="channel-description">
                {channelName} 채널에 오신 것을 환영합니다
              </p>
            </div>
          )}
          <div
            className={`chat-messages-container ${
              isDirectMessage ? "no-header" : ""
            }`}
            ref={messageListRef}
          >
            {isLoading ? (
              <div className="loading-messages">메시지를 불러오는 중...</div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id || index} className="message-item">
                  <div className="message-avatar">
                    {message.from?.charAt(0).toUpperCase()}
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-header">
                      <span className="message-sender">
                        {message.from || "Unknown"}
                      </span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <div className="message-content">{message.text}</div>
                  </div>
                </div>
              ))
            )}
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
                placeholder={`${
                  isDirectMessage ? "" : "#"
                }${channelName}에 메시지 보내기`}
                className="chat-input"
              />
            </form>
          </div>
        </>
      ) : (
        <div className="no-messages">친구와 대화해보세요!</div>
      )}
    </div>
  );
};

export default ChatRoom;
