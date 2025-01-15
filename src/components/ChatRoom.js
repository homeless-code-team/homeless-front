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
import UserProfilePopup from "./UserProfilePopup.js";
import Swal from "sweetalert2";

const ChatRoom = ({ serverId, channelName, channelId, isDirectMessage }) => {
  const { userName, userEmail } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
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
      console.log("수신된 메시지:", message);

      // 삭제된 메시지 처리
      if (message.deletedChatId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== message.deletedChatId)
        );
        return;
      }

      // 일반 메시지 처리
      const messageWithMeta = {
        id: message.chatId, // chatId를 ID로 사용
        content: message.content,
        writer: message.writer || "Unknown", // writer를 그대로 사용
        email: message.email,
        type: message.type || "TALK", // 기본 메시지 타입 설정
        timestamp: new Date().toLocaleString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      };

      setMessages((prev) => {
        // 중복 메시지 체크
        if (prev.some((msg) => msg.id === messageWithMeta.id)) {
          return prev; // 중복된 메시지가 있으면 상태를 변경하지 않음
        }
        // 새로운 메시지를 추가
        return [...prev, messageWithMeta];
      });
    },
    [serverId] // serverId를 의존성으로 추가
  );

  const { sendMessage, deleteMessage } = useWebSocket(
    channelId,
    handleMessageReceived
  );

  // 채팅 기록 불러오기
  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/ch/${channelId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("채팅 기록 응답 데이터 구조:", data);

      if (data.statusCode === 200 && data.result) {
        const messages = data.result.messages || [];
        setMessages(
          messages.map((msg) => {
            const mappedMessage = {
              id: msg.id,
              writer: msg.writer,
              email: msg.email,
              content: msg.text || msg.content, // text나 content 필드 확인
              messageType: msg.messageType || msg.type, // messageType이나 type 필드 확인
              timestamp: new Date(msg.timestamp).toLocaleString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              }),
            };
            return mappedMessage;
          })
        );
        scrollToBottom();
      }
    } catch (error) {
      console.error("채팅 기록 로딩 에러:", error);
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

  // 메시지 전송
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      serverId: serverId,
      channelId: channelId,
      writer: userName,
      email: userEmail,
      content: newMessage.trim(),
      messageType: "TALK",
    };

    try {
      console.log("전송할 메시지 데이터:", messageData);
      const response = await sendMessage(messageData);
      setNewMessage("");
      inputRef.current?.focus();

      // 서버에서 반환된 메시지 ID를 사용하여 상태 업데이트
      if (response && response.result) {
        const { chatId, content, writer, email } = response.result;
        setMessages((prev) => [
          ...prev,
          {
            id: chatId,
            content,
            writer,
            email,
            timestamp: new Date().toLocaleString("ko-KR"),
          },
        ]);
      }

      // 메시지 전송 후 스크롤
      scrollToBottom();
    } catch (error) {
      console.error("메시지 전송 중 오류 발생:", error);
      Swal.fire("오류 발생", "메시지 전송에 실패했습니다.", "error");
    }
  };

  // 엔터키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 메시지 삭제 핸들러
  const handleDeleteMessage = async (chatId) => {
    try {
      const result = await Swal.fire({
        title: "메시지 삭제",
        text: "정말로 이 메시지를 삭제하시겠습니까?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "삭제",
        cancelButtonText: "취소",
      });

      if (result.isConfirmed) {
        // WebSocket으로 삭제 요청 전송
        deleteMessage(chatId);
      }
    } catch (error) {
      console.error("메시지 삭제 중 오류 발생:", error);
      Swal.fire("오류 발생", "메시지 삭제 중 문제가 발생했습니다.", "error");
    }
  };

  // 메시지 수정 핸들러
  const handleUpdateMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/message/${messageId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: editMessageContent,
        }
      );

      if (response.ok) {
        setMessages(
          messages.map((msg) =>
            msg.id === messageId ? { ...msg, content: editMessageContent } : msg
          )
        );
        setEditingMessageId(null);
        setEditMessageContent("");
      } else {
        const errorData = await response.json();
        console.error("메시지 수정 실패:", errorData);
      }
    } catch (error) {
      console.error("메시지 수정 중 오류 발생:", error);
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
                  <div
                    className="message-avatar"
                    onClick={() => {
                      setSelectedUser({
                        name: message.writer,
                        email: message.email,
                      });
                      setShowProfilePopup(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {message.writer?.charAt(0).toUpperCase()}
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-header">
                      <span className="message-sender">
                        {message.writer || "Unknown"}
                      </span>
                      <span className="message-time">{message.timestamp}</span>
                      {message.email === userEmail && (
                        <div className="message-actions">
                          <button
                            onClick={() => {
                              setEditingMessageId(message.id);
                              setEditMessageContent(message.content);
                            }}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="delete-button"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                    {editingMessageId === message.id ? (
                      <div className="edit-message-form">
                        <input
                          type="text"
                          value={editMessageContent}
                          onChange={(e) =>
                            setEditMessageContent(e.target.value)
                          }
                        />
                        <button onClick={() => handleUpdateMessage(message.id)}>
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessageId(null);
                            setEditMessageContent("");
                          }}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="message-content">{message.content}</div>
                    )}
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

          {showProfilePopup && selectedUser && (
            <UserProfilePopup
              user={selectedUser}
              onClose={() => setShowProfilePopup(false)}
            />
          )}
        </>
      ) : (
        <div className="no-messages">친구와 대화해보세요!</div>
      )}
    </div>
  );
};

export default ChatRoom;
