import React, { useEffect, useState } from "react";
import "./FriendList.css";
import axios from "axios";

const FriendList = ({ onSelectChannel }) => {
  const token = localStorage.getItem("token");
  const [friends, setFriends] = useState([]); // 친구 목록 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [searchInput, setSearchInput] = useState(""); // 검색 입력값
  const [allUsers, setAllUsers] = useState([]); // 모든 유저 데이터
  const [filteredUsers, setFilteredUsers] = useState([]); // 초기값 빈 배열
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const itemsPerPage = 10; // 페이지당 항목 수

  const fetchFriends = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        const friendsData = res.data.data;
        const friends = friendsData.map((friendsData) => {
          const { friend, hasRefreshToken } = friendsData;
          return {
            id: friend.id,
            name: friend.nickname,
            status: hasRefreshToken === 1 ? "online" : "offline",
          };
        });
        setFriends(friends);
      } else {
        console.error("친구 목록을 가져오지 못했습니다:", res.status);
      }
    } catch (error) {
      console.error("오류 발생:", error);
    }
  };

  // 유저 전체 조회해서 가져오기
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 && Array.isArray(res.data.data)) {
        setAllUsers(res.data.data); // 모든 유저 데이터를 상태에 저장
        setFilteredUsers(res.data.data); // 초기 필터링된 데이터도 전체 유저로 설정
      } else {
        console.error("유저 데이터를 가져오지 못했습니다:", res.status);
        setAllUsers([]); // 실패 시 빈 배열 설정
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("오류 발생:", error);
      setAllUsers([]); // 실패 시 빈 배열 설정
      setFilteredUsers([]);
    }
  };
  const handleAddFriend = async (nickname) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends`,
        { receiverNickname: nickname }, // 서버에 전송할 데이터
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("====================================");
      console.log(nickname);
      console.log("====================================");

      if (res.data.code === 200) {
        alert(`${nickname}님에게 친구 추가 요청되었습니다!`);
        fetchFriends(); // 친구 목록 새로고침
      } else {
        alert("친구 추가 실패");
      }
    } catch (error) {
      console.error("친구 추가 오류:", error);
      alert("친구 추가 중 문제가 발생했습니다.");
    }
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchInput(query);
    const filtered = allUsers.filter((user) =>
      user.nickname.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1); // 검색 시 페이지 초기화
  };

  // 페이지 이동 시 현재 페이지 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchAllUsers();
    }
  }, [isModalOpen]);

  return (
    <div className="friend-list-container">
      <div className="friend-list-header">
        <h3>친구 목록</h3>
        <div className="friend-header-buttons">
          <button
            className="search-friend-button"
            onClick={() => setIsModalOpen(true)}
          >
            🔍
          </button>
        </div>
        <div className="friend-count">
          온라인 - {friends.filter((f) => f.status === "online").length}
        </div>
      </div>
      <div className="friend-list">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="friend-item"
            onClick={() => onSelectChannel(friend.id, friend.name)}
          >
            <div className="friend-avatar">
              {friend.name.charAt(0).toUpperCase()}
            </div>
            <div className="friend-info">
              <span className="friend-name">{friend.name}</span>
              <span className={`friend-status ${friend.status}`}>
                {friend.status === "online" ? "온라인" : "오프라인"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h3>친구 검색</h3>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="닉네임을 입력하세요"
            />
            <div className="search-results">
              {currentItems.map((user) => (
                <div key={user.nickname} className="search-result-item">
                  <div className="user-avatar">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="프로필 이미지"
                        className="profile-img"
                      />
                    ) : (
                      <div className="default-avatar">
                        {user.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-nickname">{user.nickname}</span>
                  </div>
                  <button
                    className="add-friend-button"
                    onClick={() => handleAddFriend(user.nickname)}
                  >
                    + 추가
                  </button>
                </div>
              ))}
            </div>
            <div className="pagination">
              {Array.from(
                { length: Math.ceil(filteredUsers.length / itemsPerPage) },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={currentPage === i + 1 ? "active" : ""}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendList;
