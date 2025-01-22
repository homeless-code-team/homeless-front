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
import axios from "axios";
import axiosInstance from "../configs/axios-config.js";

const ChatRoom = ({ serverId, channelName, channelId, isDirectMessage }) => {
  const { userName, userEmail } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const pageSize = 20;
  const messageListRef = useRef(null);
  const inputRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const searchTimerRef = useRef(null);
  const [channelStates, setChannelStates] = useState({});
  const scrollPositionsRef = useRef({});
  const [searchCategory, setSearchCategory] = useState("content");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  const isScrolledToBottom = useCallback(() => {
    if (messageListRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = messageListRef.current;
      return Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    }
    return false;
  }, []);

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

      const fileExtension = message.fileUrl
        ? message.fileUrl.split(".").pop().toLowerCase()
        : null;
      const isImage = fileExtension
        ? ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExtension)
        : false;

      const content = (
        <div style={{ position: "relative" }}>
          {message.fileUrl ? (
            <div>
              {isImage ? (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={message.fileUrl}
                    alt="파일 미리보기"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      cursor: "pointer",
                    }}
                  />
                </a>
              ) : (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="download-button">
                    <i className="fa fa-file-download"></i>
                    💽 {message.fileName}
                  </button>
                </a>
              )}
              {/* 다운로드 아이콘 추가 */}
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  textDecoration: "none",
                  color: "black",
                }}
              >
                <i className="fa fa-download" style={{ fontSize: "16px" }}></i>
              </a>
            </div>
          ) : null}
          <p>{message.content || "내용 없음"}</p>{" "}
          {/* 파일 아래에 메시지 내용 표시 */}
        </div>
      );

      const messageWithMeta = {
        id: message.chatId,
        writer: message.writer || "Unknown",
        email: message.email,
        type: message.messageType || "TALK",
        timestamp: new Date().toLocaleString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        fileUrl: message.fileUrl || null,
        fileName: message.fileName || null,
        content, // 파일 또는 기본 메시지 내용
      };

      setMessages((prevMessages) => [...prevMessages, messageWithMeta]);

      if (!shouldScrollToBottom) {
        setShowNewMessageAlert(true);
      } else {
        scrollToBottom();
      }

      // Update latestMessage with the newly received message
      setLatestMessage(message);
    },
    [setMessages, scrollToBottom, setLatestMessage, isScrolledToBottom]
  );

  const { sendMessage, deleteMessage, updateMessage } = useWebSocket(
    channelId,
    handleMessageReceived
  );

  const fetchChatHistory = useCallback(
    async (page = 0, shouldScrollToSaved = false) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("인증 토큰이 없습니다.");

        const url = `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/ch/${channelId}?page=${page}&size=${pageSize}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.statusCode === 200 && data.result) {
          const { messages: newMessages, isLast } = data.result;

          setMessages((prev) => {
            const formattedMessages = newMessages.map((msg) => {
              const fileUrl = msg.fileUrl || null; // Ensure fileUrl is defined
              const fileName = msg.fileName || null;
              const fileExtension = fileUrl
                ? fileUrl.split(".").pop().toLowerCase()
                : "";
              const isImage = [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "bmp",
                "webp",
              ].includes(fileExtension);

              // Format message content based on file type
              const content = fileUrl ? (
                <div style={{ position: "relative" }}>
                  {isImage ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={fileUrl}
                        alt="파일 미리보기"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          cursor: "pointer",
                        }}
                      />
                    </a>
                  ) : (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                      <button className="download-button">
                        <i className="fa fa-file-download"></i> 💽 {fileName}
                      </button>
                    </a>
                  )}
                  {/* 다운로드 아이콘 추가 */}
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      right: "5px",
                      textDecoration: "none",
                      color: "black",
                    }}
                  >
                    <i
                      className="fa fa-download"
                      style={{ fontSize: "16px" }}
                    ></i>
                  </a>
                </div>
              ) : (
                msg.content // Fallback to original content if no fileUrl
              );

              return {
                id: msg.id,
                writer: msg.writer,
                email: msg.email,
                content: content,
                timestamp: new Date(msg.timestamp).toLocaleString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                }),
                fileUrl: fileUrl,
                rawTimestamp: msg.timestamp,
              };
            });

            const updatedMessages =
              page === 0
                ? formattedMessages.reverse()
                : [...formattedMessages.reverse(), ...prev];

            setChannelStates((prev) => ({
              ...prev,
              [channelId]: {
                messages: updatedMessages,
                currentPage: page,
                hasNextPage: !isLast,
              },
            }));

            return updatedMessages;
          });

          setCurrentPage(page);
          setHasNextPage(!isLast);

          if (shouldScrollToSaved && messageListRef.current) {
            requestAnimationFrame(() => {
              messageListRef.current.scrollTop =
                scrollPositionsRef.current[channelId] || 0;
            });
          }
        }
      } catch (error) {
        console.error("채팅 기록 로딩 에러:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [channelId]
  );

  const loadMoreMessages = useCallback(() => {
    if (hasNextPage && !isLoading) {
      const nextPage = currentPage + 1;

      const scrollContainer = messageListRef.current;
      const previousScrollHeight = scrollContainer.scrollHeight;
      const previousScrollTop = scrollContainer.scrollTop;

      fetchChatHistory(nextPage).then(() => {
        requestAnimationFrame(() => {
          const newScrollHeight = scrollContainer.scrollHeight;
          const scrollHeightDiff = newScrollHeight - previousScrollHeight;
          scrollContainer.scrollTop = previousScrollTop + scrollHeightDiff;
        });
      });
    }
  }, [hasNextPage, isLoading, currentPage, fetchChatHistory]);

  const handleScroll = useCallback(() => {
    if (messageListRef.current) {
      const { scrollTop } = messageListRef.current;
      scrollPositionsRef.current[channelId] = scrollTop;

      if (scrollTop === 0 && hasNextPage && !isLoading) {
        loadMoreMessages();
      }
    }
  }, [channelId, hasNextPage, isLoading, loadMoreMessages]);

  useEffect(() => {
    if (channelId) {
      setMessages([]);
      setCurrentPage(0);
      setHasNextPage(true);
      fetchChatHistory(0);

      setTimeout(() => {
        if (messageListRef.current) {
          const savedScrollTop = scrollPositionsRef.current[channelId];
          if (savedScrollTop !== undefined) {
            messageListRef.current.scrollTop = savedScrollTop;
          }
        }
      }, 100);
    }
  }, [channelId, fetchChatHistory]);

  // 메시지 전송 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !uploadedFileUrl) return; // 메시지와 파일 URL이 모두 없을 경우 전송하지 않음

    const messageData = {
      serverId: serverId,
      channelId: channelId,
      writer: userName,
      email: userEmail,
      content: newMessage.trim(),
      messageType: uploadedFileUrl ? "FILE" : "TALK", // 파일이 선택된 경우 "FILE"로 설정
      fileUrl: uploadedFileUrl || null, // 업로드된 파일 URL 포함, 없으면 null
      fileName: uploadedFileName || null, // 업로드된 파일 이름 포함
    };

    console.log("전송할 메시지 데이터:", messageData); // 전송할 메시지 데이터 로그 추가

    try {
      // WebSocket을 통해 메시지 전송
      await sendMessage(messageData);
      setNewMessage("");
      setSelectedFile(null);
      setFilePreview("");
      setUploadedFileUrl(""); // 메시지 전송 후 URL 초기화
      setUploadedFileName(""); // 파일 이름 초기화
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("메시지 전송 중 오류 발생:", error);
      Swal.fire("오류 발생", "메시지 전송에 실패했습니다.", "error");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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
        deleteMessage(chatId);
      }
    } catch (error) {
      console.error("메시지 삭제 중 오류 발생:", error);
      Swal.fire("오류 발생", "메시지 삭제 중 문제가 발생했습니다.", "error");
    }
  };

  const handleUpdateMessage = async (messageId) => {
    try {
      updateMessage(channelId, messageId, editMessageContent);
    } catch (error) {
      console.error("메시지 수정 중 오류 발생:", error);
      Swal.fire("오류 발생", "메시지 수정에 실패했습니다.", "error");
    }
  };

  const handleAlertClick = () => {
    console.log("알람작동.");

    scrollToBottom();
    setShowNewMessageAlert(false);
  };

  const handleSearch = async (keyword) => {
    const trimmedKeyword = keyword.trim();
    console.log(
      "검색 시작 - 키워드:",
      trimmedKeyword,
      "카테고리:",
      searchCategory
    );

    if (!trimmedKeyword) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/chats/search?channelId=${channelId}&keyword=${trimmedKeyword}&category=${searchCategory}&page=0&size=20`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.content || []);
        setShowSearchResults(true);
        setCurrentSearchIndex(0);
        if (data.content && data.content.length > 0) {
          moveToSearchResult(0);
        }
      } else {
        Swal.fire("검색 실패", "메시지 검색 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      Swal.fire("오류 발생", "검색 중 문제가 발생했습니다.", "error");
    }
  };

  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

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

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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

  const handleSearchButtonClick = () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }
    handleSearch(searchQuery);
  };

  const moveToSearchResult = (index) => {
    if (searchResults.length === 0) return;

    let newIndex = index;
    if (index >= searchResults.length) newIndex = 0;
    if (index < 0) newIndex = searchResults.length - 1;

    const result = searchResults[newIndex];
    const messageElement = document.getElementById(`message-${result.id}`);

    if (messageElement) {
      document.querySelectorAll(".highlight").forEach((el) => {
        el.classList.remove("highlight");
      });

      messageElement.classList.add("highlight");
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      setCurrentSearchIndex(newIndex);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const findMessageWithRetry = async (messageId, maxRetries = 10) => {
    let retryCount = 0;

    const findMessage = async () => {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        return messageElement;
      }

      if (!hasNextPage || retryCount >= maxRetries) {
        return null;
      }

      retryCount++;
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      try {
        await fetchChatHistory(nextPage);
        return await findMessage();
      } catch (error) {
        console.error("메시지 로드 중 오류:", error);
        return null;
      }
    };

    return await findMessage();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(`${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      handleFileUpload(file);
      setUploadedFileName(file.name);
    }
  };
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/file/chats/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.result) {
        console.log("파일 전송 API 응답:", response.data);
        const fileUrl = response.data.result.fileUrl;
        setUploadedFileUrl(fileUrl);
      }
    } catch (error) {
      console.error("파일 업로드 중 오류 발생:", error);
      Swal.fire("오류 발생", "파일 업로드에 실패했습니다.", "error");
    }
  };

  const handleFileDelete = async () => {
    if (uploadedFileUrl) {
      try {
        const response = await axiosInstance.delete(
          `${process.env.REACT_APP_API_BASE_URL}/chat-service/api/v1/file/chats/delete`,
          {
            params: { fileUrl: uploadedFileUrl },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          console.log("파일 삭제 성공, fileUrl:", uploadedFileUrl);
          setUploadedFileUrl(null);
          setFilePreview("");
          setSelectedFile(null);
        }
      } catch (error) {
        console.error("파일 삭제 중 오류 발생:", error);
        Swal.fire("오류 발생", "파일 삭제에 실패했습니다.", "error");
      }
    }
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
                  placeholder={`${
                    searchCategory === "content" ? "메시지" : "닉네임"
                  } 검색`}
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleSearchKeyPress}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setIsSearchFocused(false), 200);
                  }}
                />
                <div className="search-category-toggle">
                  <button
                    className={`toggle-button ${
                      searchCategory === "content" ? "active" : ""
                    }`}
                    onClick={() => setSearchCategory("content")}
                    title="메시지 검색"
                  >
                    💬
                  </button>
                  <button
                    className={`toggle-button ${
                      searchCategory === "nickname" ? "active" : ""
                    }`}
                    onClick={() => setSearchCategory("nickname")}
                    title="닉네임 검색"
                  >
                    🤷‍♂️
                  </button>
                </div>
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
                              document
                                .querySelectorAll(".highlight")
                                .forEach((el) => {
                                  el.classList.remove("highlight");
                                });

                              messageElement.classList.add("highlight");
                              messageElement.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });

                              messageElement.classList.add(
                                "highlight-animation"
                              );

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
            {!hasNextPage && messages.length > 0 && (
              <div className="system-message">
                <div className="system-message-line">
                  <span className="system-message-text">
                    더이상 메시지가 없습니다
                  </span>
                </div>
              </div>
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
            {filePreview && (
              <div className="file-preview">
                <span>{filePreview}</span>
                <button onClick={handleFileDelete}>X</button>
              </div>
            )}
            <input
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <button
              className="add-content-button"
              onClick={() => fileInputRef.current.click()}
            >
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
