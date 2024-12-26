import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import "./ChatRoom.css";
import useWebSocket from "../hooks/useWebSocket.js";
import AuthContext from "../context/AuthContext.js";

const ChatRoom = ({ serverId, channelName, channelId, isDirectMessage }) => {
  const { userName } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageListRef = useRef(null);

  // 채팅 기록 불러오기
  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8181/api/chats/${serverId}/${channelId}/messages`
      );

      if (!response.ok) {
        throw new Error("채팅 기록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      console.log("받은 채팅 기록:", data);

      // 최근 20개의 메시지만 가져오기
      const recentMessages = data.slice(-20);

      setMessages(
        recentMessages.map((msg) => ({
          id: msg.id,
          text: msg.content,
          from: msg.writer || "Unknown",
          timestamp: new Date(Number(msg.timestamp)).toLocaleString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        }))
      );

      // 메시지 로드 직후 스크롤 이동
      requestAnimationFrame(() => {
        if (messageListRef.current) {
          messageListRef.current.scrollTop =
            messageListRef.current.scrollHeight;
        }
      });
    } catch (error) {
      console.error("채팅 기록 로딩 에러:", error);
    }
  }, [serverId, channelId]);

  // 채널 입장시 채팅 기록 로드
  useEffect(() => {
    if (channelId) {
      fetchChatHistory();
    }
    return () => {
      setMessages([]); // 채널 변경시 메시지 초기화
    };
  }, [channelId, fetchChatHistory]);

  const handleMessageReceived = (message) => {
    console.log("수신된 메시지:", message);
    const messageWithTime = {
      id: message.id,
      text: message.content,
      from: message.writer,
      timestamp: new Date(Number(message.timestamp)).toLocaleString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    };
    setMessages((prev) => [...prev, messageWithTime]);
  };

  const { sendMessage } = useWebSocket(
    serverId,
    channelId,
    handleMessageReceived
  );

  // 메시지 자동 스크롤
  const scrollToBottom = () => {
    if (messageListRef.current) {
      const element = messageListRef.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 새 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // 채널이 변경될 때도 스크롤
  useEffect(() => {
    if (channelId && messages.length > 0) {
      scrollToBottom();
    }
  }, [channelId, messages]);

  // 채널이 변경될 때마다 입력창 포커스
  useEffect(() => {
    inputRef.current?.focus();
  }, [channelId]);

  // 메시지 전송 핸들러 (백엔드 API를 통한 메시지 전송)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        text: newMessage.trim(),
        writer: userName,
        timestamp: Date.now(),
      };

      try {
        sendMessage(message);
        setNewMessage("");
        inputRef.current?.focus();
      } catch (error) {
        console.error("메시지 전송 오류:", error);
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

  // 이전 메시지 불러오기
  const fetchPreviousMessages = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:8181/api/chats/${serverId}/${channelId}/messages?page=${
          page + 1
        }`
      );

      if (!response.ok) {
        throw new Error("이전 메시지를 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      if (data.length > 0) {
        const oldMessages = data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          from: msg.writer || "Unknown",
          timestamp: new Date(Number(msg.timestamp)).toLocaleString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }),
        }));

        setMessages((prev) => [...oldMessages, ...prev]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("이전 메시지 로딩 에러:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, serverId, channelId, page]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop } = e.target;
      if (scrollTop === 0 && !isLoading) {
        const scrollHeight = e.target.scrollHeight;
        fetchPreviousMessages().then(() => {
          if (messageListRef.current) {
            const newScrollHeight = messageListRef.current.scrollHeight;
            messageListRef.current.scrollTop = newScrollHeight - scrollHeight;
          }
        });
      }
    },
    [isLoading, fetchPreviousMessages]
  );

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
      return () => messageList.removeEventListener("scroll", handleScroll);
    }
  }, [page, isLoading, handleScroll]);

  return (
    <div className="chat-room-container">
      {channelId ? (
        <>
          {!isDirectMessage && (
            <div className="chat-header">
              <h3>{channelName}</h3>
              <div className="header-divider"></div>
              <p className="channel-description">
                {channelName} 채널��� 오신 것을 환영합니다
              </p>
            </div>
          )}
          <div
            className={`chat-messages-container ${
              isDirectMessage ? "no-header" : ""
            }`}
            ref={messageListRef}
          >
            {messages.map((message, index) => (
              <div key={message.id || index} className="message-item">
                <div className="message-header">
                  <span className="message-sender">
                    {message.from || "Unknown"}
                  </span>
                  <span className="message-time">{message.timestamp}</span>
                </div>
                <div className="message-content">{message.text}</div>
              </div>
            ))}
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
        <div className="no-messages">채구와 대화해보세요!</div>
      )}
    </div>
  );
};

export default ChatRoom;
