import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Board.css";
import Swal from "sweetalert2";

function Board({ serverId, boardId, boardTitle, serverRole }) {
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    boardId: null,
  });

  const [editModal, setEditModal] = useState(false);
  const [editBoardId, setEditBoardId] = useState(null);

  useEffect(() => {
    if (boardId) {
      fetchPosts();
    }

    const handleClick = () =>
      setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [boardId]);

  const email = localStorage.getItem("userEmail");

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/server/boards?id=${boardId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);

      setPosts(response.data.result);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다:", error);
    }
  };

  const handleCreateBoard = async () => {
    const formData = new FormData();

    formData.append("title", newBoardTitle);
    formData.append("boardListId", boardId);
    const res = await axios.post(
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
      setShowModal(false);
    } else {
      alert("게시글 작성중 문제가 발생했습니다.");
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
      const res = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/server/boards?id=${boardId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status === 200) {
        fetchPosts();
        setShowModal(false);
        setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
      } else {
        alert("게시글 삭제중 문제가 발생했습니다.");
        setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
      }
    }
  };

  const handleEditBoard = async () => {
    const formData = new FormData();

    formData.append("boardId", editBoardId);
    formData.append("boardTitle", newBoardTitle);

    const res = await axios.put(
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
      setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
    } else {
      alert("게시글 삭제중 문제가 발생했습니다.");
      setEditModal(false);
      setEditModal(null);
      setNewBoardTitle(null);
      setContextMenu({ visible: false, x: 0, y: 0, serverId: null });
    }
  };

  return (
    <div className="board-container">
      <div className="chat-header">
        <h3>{boardTitle}</h3>
        <div className="header-divider"></div>
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
        {posts.map((post) => (
          <div
            key={post.id}
            className="post-item"
            onContextMenu={(e) => {
              e.preventDefault(); // 기본 우클릭 메뉴 방지
              handleContextMenu(e, post); // 우클릭 시 호출할 함수
            }}
          >
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>작성자: {post.writer}</small>
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
      {contextMenu.visible && contextMenu.writer === email && (
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
