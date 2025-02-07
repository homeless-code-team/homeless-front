import React, { useEffect, useState } from "react";
import "./FriendList.css";
import axiosInstance from "../configs/axios-config";

const FriendList = ({ onSelectChannel }) => {
  const token = localStorage.getItem("token");
  const [currentTab, setCurrentTab] = useState("friends"); // 현재 탭 상태
  const [friends, setFriends] = useState([]); // 친구 목록 상태
  const [sentRequests, setSentRequests] = useState([]); // 친구 요청한 목록
  const [filteredSentRequests, setFilteredSentRequests] = useState([]); // 검색된 보낸 요청
  const [receivedRequests, setReceivedRequests] = useState([]); // 친구 요청받은 목록
  const [filteredReceivedRequests, setFilteredReceivedRequests] = useState([]); // 검색된 받은 요청
  const [allUsers, setAllUsers] = useState([]); // 모든 유저 목록
  const [filteredUsers, setFilteredUsers] = useState([]); // 검색된 유저 목록
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [searchInput, setSearchInput] = useState(""); // 검색 입력 상태
  const [requestSearchInput, setRequestSearchInput] = useState(""); // 요청 검색 입력 상태

  const fetchFriends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends`
      );

      if (res.data.code === 200) {
        const friendsData = res.data.data;

        // 백엔드에서 반환된 친구 목록을 기반으로 데이터를 변환
        const friends = friendsData.map(
          ({ id, email, nickname, profileImage }) => ({
            id: id,
            nickname: nickname,
            email: email, // 이메일을 닉네임으로 표시하도록 변경
            profileImage: profileImage || null, // profileImage 필드는 백엔드에서 제공되지 않으므로 null 처리
            // 친구 상태 정보 추가
          })
        );

        // 모든 친구 목록을 로그에 찍기
        console.log("친구 목록:", friends);

        setFriends(friends); // 친구 목록 상태 업데이트
      } else {
        setError("친구 목록을 가져오지 못했습니다.");
      }
    } catch (error) {
      setError("오류 발생: 친구 목록을 가져오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends/request`
      );

      if (res.data.code === 200) {
        setSentRequests(res.data.data);
        setFilteredSentRequests(res.data.data);
      } else {
        setError("보낸 친구 요청 목록을 가져오지 못했습니다.");
      }
    } catch (error) {
      setError("오류 발생: 보낸 친구 요청을 가져오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReceived = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends/response`
      );
      if (res.data.code === 200) {
        setReceivedRequests(res.data.data);
        setFilteredReceivedRequests(res.data.data);
      } else {
        setError("받은 친구 요청 목록을 가져오지 못했습니다.");
      }
    } catch (error) {
      setError("오류 발생: 받은 친구 요청을 가져오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/users/all`
      );
      if (res.data.code === 200) {
        setAllUsers(res.data.data);
        setFilteredUsers(res.data.data);
      } else {
        setError("모든 유저 목록을 가져오지 못했습니다.");
      }
    } catch (error) {
      setError("오류 발생: 모든 유저 목록을 가져오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (nickname) => {
    const requestData = {
      receiverNickname: nickname,
      addStatus: "PENDING",
    };

    console.log("requestData: ", requestData);

    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends`,
        requestData
      );
      if (res.data.code === 200) {
        alert(`${nickname}님에게 친구 요청을 보냈습니다.`);
        fetchSentRequests();
      } else if (res.data.code === 400) {
        alert(res.data.message);
      } else {
        alert("친구 요청을 보내는 데 실패했습니다.");
      }
    } catch (error) {
      alert("친구 요청 중 오류가 발생했습니다.");
    }
  };

  const handleAccept = async (receiverNickname) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends/response`,
        {
          receiverNickname,
          addStatus: "ACCEPT",
        }
      );
      if (res.data.code === 200) {
        alert(`${receiverNickname}님과 친구가 되었습니다.`);
        fetchReceived();
        fetchFriends();
      } else {
        setError("친구 추가 실패");
      }
    } catch (error) {
      setError("오류 발생: 친구 추가 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (receiverNickname) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends/response`,
        {
          receiverNickname,
          addStatus: "REJECTED",
        }
      );
      if (res.data.code === 200) {
        alert(`${receiverNickname}님과 친구요청을 거절하였습니다..`);
        fetchReceived();
        fetchFriends();
      } else {
        setError("친구 요청 거절 실패");
      }
    } catch (error) {
      setError("오류 발생: 친구 추가 거절  실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (nickname) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.delete(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends/request`,
        {
          params: { receiverNickname: nickname },
        }
      );
      if (res.data.code === 200) {
        alert(`${nickname}님과 친구 요청이 취소 되었습니다.`);
        fetchSentRequests();
        fetchFriends();
      } else {
        setError("친구 추가 취소 실패");
      }
    } catch (error) {
      setError("오류 발생: 친구 추가 취소 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFriend = async (nickname) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(nickname);
      const res = await axiosInstance.delete(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends`,
        {
          params: { receiverNickname: nickname },
        }
      );
      if (res.data.code === 200) {
        alert(`${nickname}님과 친구 관계가 삭제되었습니다.`);
        fetchFriends();
      } else {
        setError("친구 관계 삭제 실패");
      }
    } catch (error) {
      setError("오류 발생: 친구 관계 삭제 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === "friends") {
      fetchFriends();
    } else if (currentTab === "sentRequests") {
      fetchSentRequests();
    } else if (currentTab === "receivedRequests") {
      fetchReceived();
    }
  }, [currentTab]);

  const handleSearchInputChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchInput(query);
    setFilteredUsers(
      allUsers.filter((user) => user.nickname.toLowerCase().includes(query))
    );
  };

  const handleRequestSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setRequestSearchInput(query);
    if (currentTab === "sentRequests") {
      setFilteredSentRequests(
        sentRequests.filter((request) =>
          request.receiverNickname.toLowerCase().includes(query)
        )
      );
    } else if (currentTab === "receivedRequests") {
      setFilteredReceivedRequests(
        receivedRequests.filter((request) =>
          request.receiverNickname.toLowerCase().includes(query)
        )
      );
    }
  };

  const renderTabContent = () => {
    if (currentTab === "friends") {
      return (
        <div className="tab-content vertical-layout sidebar-aligned">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="friend-item"
              onClick={() => onSelectChannel(friend.id, friend.nickname)}
            >
              <div className="friend-avatar">
                {friend.profileImage ? (
                  <img src={friend.profileImage} alt="프로필 이미지" />
                ) : (
                  friend.nickname.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="friend-info">
                <span className="friend-name">{friend.nickname}</span>
                <span className="friend-status">{friend.profileImage}</span>
              </div>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `정말 ${friend.nickname}친구를 삭제하시겠습니까?`
                    )
                  ) {
                    handleDeleteFriend(friend.nickname);
                  }
                }}
              >
                {" "}
                삭제{" "}
              </button>
            </div>
          ))}
        </div>
      );
    } else if (currentTab === "sentRequests") {
      return (
        <div className="tab-content vertical-layout sidebar-aligned">
          <input
            type="text"
            value={requestSearchInput}
            onChange={handleRequestSearchChange}
            placeholder="보낸 요청 검색"
            className="search-bar"
          />
          {filteredSentRequests.map((request) => (
            <div key={request.receiverNickname} className="friend-item">
              <div className="friend-avatar">
                {request.profileImage ? (
                  <img src={request.profileImage} alt="프로필 이미지" />
                ) : (
                  request.receiverNickname.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="friend-info">
                <span className="friend-name">{request.receiverNickname}</span>
                <span className="friend-status">{request.email}</span>
              </div>
              <button onClick={() => handleCancel(request.receiverNickname)}>
                요청 취소
              </button>
            </div>
          ))}
        </div>
      );
    } else if (currentTab === "receivedRequests") {
      return (
        <div className="tab-content vertical-layout sidebar-aligned">
          <input
            type="text"
            value={requestSearchInput}
            onChange={handleRequestSearchChange}
            placeholder="받은 요청 검색"
            className="search-bar"
          />
          {filteredReceivedRequests.map((request) => (
            <div key={request.receiverNickname} className="friend-item">
              <div className="friend-avatar">
                {request.profileImage ? (
                  <img src={request.profileImage} alt="프로필 이미지" />
                ) : (
                  request.receiverNickname.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="friend-info">
                <span className="friend-name">{request.receiverNickname}</span>
                <span className="friend-status">{request.email}</span>
              </div>
              <button onClick={() => handleAccept(request.receiverNickname)}>
                수락
              </button>
              <button onClick={() => handleReject(request.receiverNickname)}>
                거절
              </button>
            </div>
          ))}
        </div>
      );
    }
  };

  const renderModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setIsModalOpen(false)}>
            &times;
          </button>
          <h3>모든 유저 검색</h3>
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="닉네임을 검색하세요"
            className="search-bar"
          />
          <div className="search-results">
            {filteredUsers.map((user) => (
              <div key={user.nickname} className="search-result-item">
                <div className="user-avatar">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="프로필 이미지"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <div
                      className="default-avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#ddd",
                        color: "#555",
                        fontWeight: "bold",
                      }}
                    >
                      {user.nickname.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <span className="user-nickname">{user.nickname}</span>
                  <span className="user-tag">#{user.tag || "0000"}</span>
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
        </div>
      </div>
    );
  };

  return (
    <div className="friend-list-container sidebar-aligned">
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">로딩 중...</div>}
      <div className="tabs vertical-layout">
        <button
          className={currentTab === "friends" ? "active" : ""}
          onClick={() => setCurrentTab("friends")}
        >
          친구 목록
        </button>
        <button
          className={currentTab === "sentRequests" ? "active" : ""}
          onClick={() => setCurrentTab("sentRequests")}
        >
          보낸 요청
        </button>
        <button
          className={currentTab === "receivedRequests" ? "active" : ""}
          onClick={() => setCurrentTab("receivedRequests")}
        >
          받은 요청
        </button>
        <button
          className="search-button"
          onClick={() => {
            setIsModalOpen(true);
            fetchAllUsers();
          }}
        >
          🔍
        </button>
      </div>
      {renderTabContent()}
      {renderModal()}
    </div>
  );
};

export default FriendList;
