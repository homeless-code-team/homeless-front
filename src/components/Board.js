import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./Board.css";
import Swal from "sweetalert2";
import { IoSearch } from "react-icons/io5";
import { ImEllo } from "react-icons/im";
import axiosInstance from "../configs/axios-config";

function Board({
  serverId,
  boardId,
  boardTitle,
  posts,
  setPosts,
  page,
  setPage,
  setSearchValue,
  searchValue,
  handleSelectBoard,
  getServerList,
  handleSelectServer,
  serverName,
  serverRole,
  serverTag,
  serverType,
}) {
  // const [posts, setPosts] = useState([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    boardId: null,
  });

  const [editModal, setEditModal] = useState(false);
  const [editBoardId, setEditBoardId] = useState(null);

  // const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const [showModal, setShowModal] = useState(false);

  const lastPostElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  useEffect(() => {
    fetchPosts();
  }, [boardId, page]);

  useEffect(() => {
    const handleClick = () =>
      setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const email = localStorage.getItem("userEmail");

  const fetchPosts = async () => {
    console.log("페이지는 ? ", page);

    // ?id=${boardId}&page=${page}&size=8
    // const data = new FormData();
    // data.append("id", boardId);
    // data.append("page", page);
    // data.append("size", 8);
    // data.append("search", searchValue);

    const params = {
      id: boardId, // BoardSearchDto의 id 필드
      page: page, // Pageable의 page
      size: 8, // Pageable의 size
    };

    if (searchValue) {
      params.searchName = searchValue;
    }

    try {
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/server/boards`,

        {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(response.data);

      setPosts((prevPosts) => [...prevPosts, ...response.data.result.content]);
      setHasMore(!response.data.result.content.last);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다:", error);
      handleSelectBoard(null);
    }
  };

  const handleCreateBoard = async () => {
    const formData = new FormData();

    formData.append("title", newBoardTitle);
    formData.append("boardListId", boardId);
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE_URL}/server/boards`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.status === 200) {
        setShowModal(false);
        setPosts([]); // 기존 게시글 목록 초기화
        setPage(0);
        fetchPosts(0);
      }
    } catch (error) {
      setShowModal(false);
      handleSelectBoard(null);
      handleSelectServer(
        serverId,
        serverName,
        serverRole,
        serverTag,
        serverType
      );
      Swal.fire("삭제된 서버의 게시판이거나 삭제된 게시판입니다.");
    }
  };

  const handleContextMenu = useCallback((e, board) => {
    e.preventDefault();
    console.log("asd");

    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      boardId: board.id,
      writer: board.writer,
    });
  }, []);

  const handleDeleteBoard = async (boardId) => {
    const result = await Swal.fire({
      title: "채널 삭제",
      text: "정말로 이 채널을 삭제하시겠습니까?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    });

    if (result.isConfirmed) {
      const res = await axiosInstance.delete(
        `${process.env.REACT_APP_API_BASE_URL}/server/boards`, // Base URL
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            serveId: serverId, // 서버 ID
            boardId: boardId, // 게시판 ID
          },
        }
      );

      if (res.status === 200) {
        setShowModal(false);
        setPosts([]); // 기존 게시글 목록 초기화
        setPage(0);
        fetchPosts(0);
        setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
      } else {
        Swal.fire("삭제된 서버의 게시판이거나 삭제된 게시판입니다.");
        handleSelectServer(
          serverId,
          serverName,
          serverRole,
          serverTag,
          serverType
        );
        getServerList();
        setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
      }
    }
  };

  const handleEditBoard = async () => {
    const formData = new FormData();

    formData.append("boardId", editBoardId);
    formData.append("boardTitle", newBoardTitle);

    const res = await axiosInstance.put(
      `${process.env.REACT_APP_API_BASE_URL}/server/boards`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (res.status === 200) {
      fetchPosts();
      setEditModal(false);
      setEditModal(null);
      setNewBoardTitle(null);
      setPosts([]); // 기존 게시글 목록 초기화
      setPage(0);
      fetchPosts(0);
      setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
    } else {
      Swal.fire("삭제된 서버의 게시판이거나 삭제된 게시판입니다.");
      setEditModal(false);
      setEditModal(null);
      setNewBoardTitle(null);
      handleSelectServer(
        serverId,
        serverName,
        serverRole,
        serverTag,
        serverType
      );
      getServerList();
      setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
    }
  };

  const handleSearch = () => {
    setPosts([]);
    setPage(0);
    fetchPosts(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // 게시글 클릭 핸들러 추가
  const handlePostClick = (postId) => {
    // 게시글 ID를 채널 ID로 사용하여 채팅방으로 이동
    handleSelectBoard(postId);
  };

  return (
    <div className="board-container">
      <div className="chat-header">
        <h3>{boardTitle}</h3>
        <div className="header-divider"></div>
        <IoSearch />
        <input
          type="text"
          className="search-input"
          placeholder="검색"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="header-buttons">
          <button
            className="add-post-button"
            onClick={() => setShowModal(true)}
          >
            새로운 게시글 +
          </button>
        </div>
      </div>

      <div className="board-header"></div>
      <div className="posts-list">
        {posts.map((post, index) => (
          <div
            key={post.index}
            className="post-item"
            onClick={() => handlePostClick(post.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleContextMenu(e, post);
            }}
            ref={posts.length === index + 1 ? lastPostElementRef : null}
          >
            <h3 className="post-title">{post.title}</h3>
            <p className="board-content">{post.content}</p>
            <small className="post-writer">작성자: {post.writer}</small>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>게시글 작성</h3>
            <input
              type="text"
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="새로운 게시글 제목을 입력하세요"
            />
            <div className="modal-buttons">
              <button onClick={handleCreateBoard}>생성</button>
              <button onClick={() => setShowModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
      {contextMenu.visible &&
        (contextMenu.writer === email ||
          serverRole === "OWNER" ||
          serverRole === "MANAGER") && (
          <div
            className="context-menu"
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
            }}
          >
            <button onClick={() => handleDeleteBoard(contextMenu.boardId)}>
              게시글 삭제
            </button>
            <button
              onClick={() => {
                setEditBoardId(contextMenu.boardId);
                setEditModal(true);
              }}
            >
              게시글 수정
            </button>
          </div>
        )}

      {editModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>게시글 수정</h3>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="수정할 게시글 제목을 입력하세요"
            />
            <div className="modal-buttons">
              <button onClick={handleEditBoard}>수정</button>
              <button onClick={() => setEditModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;
