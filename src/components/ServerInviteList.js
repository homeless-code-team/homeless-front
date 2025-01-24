import React, { useEffect, useState } from "react";
import "./FriendList.css";
import axios from "axios";
import axiosInstance from "../configs/axios-config";

const FriendList = ({ onSelectChannel }) => {
  const token = localStorage.getItem("token");
  const [currentTab, setCurrentTab] = useState("friends"); // 현재 탭 상태
  const [inviteServerList, setInviteServerList] = useState([]);

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

  useEffect(() => {
    fetchInviteServer();
  }, []);

  const fetchInviteServer = async () => {
    const res = await axiosInstance.get(
      `${process.env.REACT_APP_API_BASE_URL}/server/inviteList`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // 토큰을 헤더에 추가
        },
      }
    );

    console.log("asdasdasdsasadassa", res);

    setInviteServerList(res.data.result);
  };

  return (
    <div className="friend-list-container sidebar-aligned">
      {error && <div className="error-message">{error}</div>}
      {isLoading && <div className="loading-message">로딩 중...</div>}
      <div className="tabs vertical-layout">
        <div>서버 초대 요청 목록</div>
      </div>

      {inviteServerList.map((server) => (
        <div key={server.id}>
          <div>
            <img src={server.serverImg} alt="asd" />
            <span>{server.title}</span>
          </div>
          <button>수락</button>
          <button>거절</button>
        </div>
      ))}
    </div>
  );
};

export default FriendList;
