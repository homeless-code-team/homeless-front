import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import "./ChatRoom.css";
import AuthContext from "../context/AuthContext.js";
import useWebSocket from "../hooks/useWebSocket.js";

const ChatRoom = ({ serverId, channelName, channelId, isDirectMessage }) => {
  const { userName, userEmail } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
        content: message.content,
        from: message.writer,
        email: message.email,
        type: message.type,
        timestamp: new Date().toLocaleString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      };
      setMessages((prev) => {
        const newMessages = [...prev, messageWithTime];
        // 상태 업데이트 후 스크롤 실행을 위해 setTimeout 사용
        setTimeout(() => {
          scrollToBottom();
        }, 0);
        return newMessages;
      });
    },
    [scrollToBottom]
  );

  const { sendMessage } = useWebSocket(channelId, handleMessageReceived);

  // 채팅 기록 불러오기
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/${channelId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("채팅 기록 응답:", data); // 응답 데이터 구조 확인

      if (data.statusCode === 200 && data.result) {
        const messages = data.result.messages || [];
        console.log("API 응답 메시지:", messages); // API 응답 구조 확인

        setMessages(
          messages.map((msg) => {
            const mappedMessage = {
              id: msg.id,
              from: msg.writer,
              email: msg.email,
              content: msg.text || msg.content, // text나 content 필드 확인
              type: msg.messageType || msg.type, // messageType이나 type 필드 확인
              timestamp: new Date(msg.timestamp).toLocaleString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              }),
            };
            console.log("매핑된 메시지:", mappedMessage);
            return mappedMessage;
          })
        );
        scrollToBottom();
      } else {
        throw new Error(
          data.statusMessage || "채팅 기록을 불러오는데 실패했습니다."
        );
      }
    } catch (error) {
      console.error("채팅 기록 로딩 에러:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, scrollToBottom]);

  // 채널 변경 시 채팅 기록 로드
  useEffect(() => {
    if (channelId) {
      fetchChatHistory();
      setMessages([]); // 채널 변경시 메시지 초기화
    }
  }, [channelId, fetchChatHistory]);

  // 메시지 DB 저장
  const saveChatMessage = async (messageData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/${channelId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channelId: channelId,
            writer: messageData.writer,
            email: userEmail,
            content: messageData.content,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "메시지 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("메시지 저장 에러:", error);
    }
  };

  // 메시지 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      channelId: channelId,
      writer: userName,
      content: newMessage.trim(),
      type: "TALK",
    };

    // WebSocket으로 메시지 전송
    sendMessage(messageData);

    // REST API로 메시지 저장
    await saveChatMessage(messageData);

    setNewMessage("");
    inputRef.current?.focus();

    // 메시지 전송 후 스크롤
    setTimeout(() => {
      scrollToBottom();
    }, 0);
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
                    <div className="message-content">{message.content}</div>
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
