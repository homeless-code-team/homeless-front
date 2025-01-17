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
  const [channelStates, setChannelStates] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const messageListRef = useRef(null);
  const inputRef = useRef(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const searchTimerRef = useRef(null);

  // 스크롤 처리
  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  // 스크롤이 맨 아래에 있는지 확인하는 함수 추가
  const isScrolledToBottom = useCallback(() => {
    if (messageListRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = messageListRef.current;
      return Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    }
    return false;
  }, []);

  // 메시지 수신 처리
  const handleMessageReceived = useCallback(
    (message) => {
      console.log("수신된 메시지:", message);

      if (message.statusCode !== undefined) {
        if (
          message.result &&
          message.result.chatId &&
          message.result.reqMessage
        ) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === message.result.chatId
                ? { ...msg, content: message.result.reqMessage }
                : msg
            )
          );
          setEditingMessageId(null);
          setEditMessageContent("");
        }
        return;
      }

      const shouldScrollToBottom = isScrolledToBottom();

      if (message.deletedChatId) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== message.deletedChatId)
        );
        return;
      }

      const messageWithMeta = {
        id: message.chatId,
        content: message.content,
        writer: message.writer || "Unknown",
        email: message.email,
        type: message.messageType || "TALK",
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
          return prev;
        }

        if (!shouldScrollToBottom) {
          setLatestMessage(messageWithMeta);
          setShowNewMessageAlert(true);
          setTimeout(() => setShowNewMessageAlert(false), 10000);
        } else {
          setTimeout(() => scrollToBottom(), 100);
        }

        return [...prev, messageWithMeta];
      });
    },
    [serverId, isScrolledToBottom, scrollToBottom]
  );

  const { sendMessage, deleteMessage, updateMessage } = useWebSocket(
    channelId,
    handleMessageReceived
  );

  // 채팅 기록 불러오기
  const fetchChatHistory = useCallback(
    async (page = 0, size = 30, lastId = null) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("인증 토큰이 없습니다.");
        }

        let url = `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/ch/${channelId}?page=${page}&size=${size}`;
        if (lastId) {
          url += `&lastId=${lastId}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.statusCode === 200 && data.result) {
          const messages = data.result.messages || [];
          setHasMore(data.result.currentPage < data.result.totalPages - 1);

          setMessages((prev) => {
            const newMessages = messages
              .map((msg) => ({
                id: msg.id,
                writer: msg.writer,
                email: msg.email,
                content: msg.content,
                timestamp: new Date(msg.timestamp).toLocaleString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                }),
              }))
              .reverse();

            if (page === 0) {
              setTimeout(() => scrollToBottom(), 100);
              return newMessages;
            }

            if (messages.length > 0) {
              setLastMessageId(messages[0].id);
            }

            return [...newMessages, ...prev];
          });
        }
      } catch (error) {
        console.error("채팅 기록 로딩 에러:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [channelId, scrollToBottom]
  );

  // 더 불러오기 버튼 클릭 핸들러
  const loadMoreMessages = () => {
    if (hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      // 현재 스크롤 위치와 높이 저장
      const scrollContainer = messageListRef.current;
      const previousScrollHeight = scrollContainer.scrollHeight;
      const previousScrollTop = scrollContainer.scrollTop;

      fetchChatHistory(nextPage, pageSize, lastMessageId).then(() => {
        // requestAnimationFrame을 사용하여 DOM 업데이트 후 스크롤 위치 조정
        requestAnimationFrame(() => {
          const newScrollHeight = scrollContainer.scrollHeight;
          const scrollHeightDiff = newScrollHeight - previousScrollHeight;
          scrollContainer.scrollTop = previousScrollTop + scrollHeightDiff;
        });
      });
    }
  };

  // 스크롤 이벤트 처리
  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop } = messageListRef.current;
      // 스크롤이 최상단에 도달하면 더보기 버튼 표시
      setShowLoadMoreButton(scrollTop === 0 && hasMore && !isLoading);
    }
  };

  // 채널 변경 시 초기화
  useEffect(() => {
    if (channelId) {
      const savedState = channelStates[channelId];

      if (savedState) {
        setMessages(savedState.messages);
        setCurrentPage(savedState.currentPage);
        setHasMore(savedState.hasMore);
        setLastMessageId(savedState.lastMessageId);
      } else {
        setMessages([]);
        setCurrentPage(0);
        setHasMore(true);
        setLastMessageId(null);
        fetchChatHistory(0, pageSize);
      }
    }
  }, [channelId, pageSize, fetchChatHistory]);

  // 상태 변경 시 channelStates 업데이트
  useEffect(() => {
    if (channelId && messages.length > 0) {
      const currentState = channelStates[channelId];
      const newState = {
        messages,
        currentPage,
        hasMore,
        lastMessageId,
      };

      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        setChannelStates((prev) => ({
          ...prev,
          [channelId]: newState,
        }));
      }
    }
  }, [channelId, messages]);

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
      await sendMessage(messageData);
      setNewMessage("");
      inputRef.current?.focus();
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
      updateMessage(channelId, messageId, editMessageContent);
    } catch (error) {
      console.error("메시지 수정 중 오류 발생:", error);
      Swal.fire("오류 발생", "메시지 수정에 실패했습니다.", "error");
    }
  };

  // 알림 클릭 핸들러 추가
  const handleAlertClick = () => {
    scrollToBottom();
    setShowNewMessageAlert(false);
  };

  // 검색 핸들러 수정
  const handleSearch = async (keyword) => {
    const trimmedKeyword = keyword.trim();
    console.log("검색 시작 - 키워드:", trimmedKeyword);

    if (!trimmedKeyword) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/search?channelId=${channelId}&keyword=${trimmedKeyword}&page=0&size=20`;
      console.log("검색 요청 URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("검색 응답 데이터:", data);

      if (response.ok) {
        console.log("검색 결과:", data.content);
        setSearchResults(data.content || []);
        setShowSearchResults(true);
        setCurrentSearchIndex(0);
        if (data.content && data.content.length > 0) {
          moveToSearchResult(0);
        }
      } else {
        console.error("검색 실패:", data);
        Swal.fire("검색 실패", "메시지 검색 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      Swal.fire("오류 발생", "검색 중 문제가 발생했습니다.", "error");
    }
  };

  // 검색 입력창 키 입력 핸들러 수정
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);

    // 이전 타이머가 있다면 취소
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // 새로운 타이머 설정
    searchTimerRef.current = setTimeout(() => {
      const trimmedValue = e.target.value.trim();
      if (trimmedValue) {
        handleSearch(trimmedValue);
      } else {
        setShowSearchResults(false);
        setSearchResults([]);
      }
    }, 500);
  };

  // 검색 입력창 키 입력 핸들러 추가
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // 진행 중인 타이머 취소
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      if (!searchQuery.trim()) {
        setShowSearchResults(false);
        setSearchResults([]);
        return;
      }
      handleSearch(searchQuery);
    }
  };

  // 검색 버튼 클릭 핸들러 수정
  const handleSearchButtonClick = () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }
    handleSearch(searchQuery);
  };

  // 검색 결과 이동 함수 추가
  const moveToSearchResult = (index) => {
    if (searchResults.length === 0) return;

    // 인덱스 순환
    let newIndex = index;
    if (index >= searchResults.length) newIndex = 0;
    if (index < 0) newIndex = searchResults.length - 1;

    const result = searchResults[newIndex];
    const messageElement = document.getElementById(`message-${result.id}`);

    if (messageElement) {
      // 이전 하이라이트 제거
      document.querySelectorAll(".highlight").forEach((el) => {
        el.classList.remove("highlight");
      });

      // 새로운 메시지 하이라이트 및 스크롤
      messageElement.classList.add("highlight");
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setCurrentSearchIndex(newIndex);
    }
  };

  // 컴포넌트 cleanup을 위한 useEffect 추가
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // 메시지 찾기 함수 추가
  const findMessageWithRetry = async (messageId, maxRetries = 10) => {
    let retryCount = 0;

    const findMessage = async () => {
      // 현재 DOM에서 메시지 찾기
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        return messageElement;
      }

      // 더 이상 불러올 메시지가 없거나 최대 시도 횟수 초과
      if (!hasMore || retryCount >= maxRetries) {
        return null;
      }

      // 이전 메시지 로드
      retryCount++;
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      try {
        await fetchChatHistory(nextPage, pageSize, lastMessageId);
        // 재귀적으로 다시 시도
        return await findMessage();
      } catch (error) {
        console.error("메시지 로드 중 오류:", error);
        return null;
      }
    };

    return await findMessage();
  };

  return (
    <div className="chat-room-container">
      {channelId ? (
        <>
          {!isDirectMessage && (
            <div className="chat-header">
              <div className="header-left">
                <h3>{channelName}</h3>
                <div className="header-divider"></div>
                <p className="channel-description">
                  {channelName} 채널에 오신 것을 환영합니다
                </p>
              </div>
              <div
                className={`search-container ${
                  isSearchFocused ? "focused" : ""
                }`}
              >
                <span
                  className="search-icon"
                  onClick={handleSearchButtonClick}
                  style={{ cursor: "pointer" }}
                >
                  🔍
                </span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="메시지 검색"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleSearchKeyPress}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    // 클릭 이벤트가 발생할 시간을 주기 위해 약간의 딜레이를 줍니다
                    setTimeout(() => setIsSearchFocused(false), 200);
                  }}
                />
                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-dropdown">
                    {searchResults.map((result, index) => (
                      <div
                        key={result.id}
                        className="search-result-item"
                        onClick={async () => {
                          console.log("클릭한 메시지 ID:", result.id);
                          try {
                            const messageElement = await findMessageWithRetry(
                              result.id
                            );
                            if (messageElement) {
                              // 이전 하이라이트 제거
                              document
                                .querySelectorAll(".highlight")
                                .forEach((el) => {
                                  el.classList.remove("highlight");
                                });

                              // 새로운 메시지 하이라이트 및 스크롤
                              messageElement.classList.add("highlight");
                              messageElement.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });

                              // 하이라이트 효과를 주기 위한 클래스 추가
                              messageElement.classList.add(
                                "highlight-animation"
                              );

                              // 2초 후에 애니메이션 클래스 제거
                              setTimeout(() => {
                                messageElement.classList.remove(
                                  "highlight-animation"
                                );
                              }, 2000);

                              setCurrentSearchIndex(index);
                            }
                          } catch (error) {
                            console.error("메시지 찾기 중 오류:", error);
                          }
                        }}
                      >
                        <div className="search-result-header">
                          <span className="search-result-writer">
                            {result.writer}
                          </span>
                          <span className="search-result-time">
                            {new Date(result.timestamp).toLocaleString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </span>
                        </div>
                        <div className="search-result-content">
                          {result.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            className={`chat-messages-container ${
              isDirectMessage ? "no-header" : ""
            }`}
            ref={messageListRef}
            onScroll={handleScroll}
          >
            {showLoadMoreButton && (
              <button
                onClick={loadMoreMessages}
                className="load-more-button"
                disabled={isLoading}
              >
                이전 메시지 더 보기
              </button>
            )}
            {isLoading && (
              <div className="loading-messages">메시지를 불러오는 중...</div>
            )}
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                id={`message-${message.id}`}
                className="message-item"
              >
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
                        onChange={(e) => setEditMessageContent(e.target.value)}
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
      {showNewMessageAlert && latestMessage && (
        <div className="new-message-alert" onClick={handleAlertClick}>
          <div className="alert-avatar">
            {latestMessage.writer?.charAt(0).toUpperCase()}
          </div>
          <div className="alert-content">
            <span className="new-message-writer">{latestMessage.writer}</span>
            <span className="new-message-preview">{latestMessage.content}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
