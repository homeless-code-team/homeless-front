import React, { useEffect, useState } from "react";
import "./FriendList.css";
import axios from "axios";

const FriendList = ({ onSelectChannel }) => {
  const token = localStorage.getItem("token");
  const [friends, setFriends] = useState([]); // 친구 목록 상태

  const fetchFriends = async () => {
    try {
      // 서버에서 친구 목록을 가져옴
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/friends-service/api/v1/friends`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 인증 토큰 추가
          },
          withCredentials: true, // 쿠키 포함
        }
      );

      if (res.status === 200) {
        const friendsData = res.data.data; // 응답 데이터
        console.log("====================================");
        console.log(friendsData);
        console.log("====================================");
        const friends = friendsData.map((friendsData) => {
          const { friend, hasRefreshToken } = friendsData; // 구조 분해 할당
          return {
            id: friend.id,
            name: friend.nickname, // 닉네임
            status: hasRefreshToken === 1 ? "online" : "offline", // 상태
          };
        });

        setFriends(friends); // 상태 업데이트
      } else {
        console.error("친구 목록을 가져오지 못했습니다:", res.status);
      }
    } catch (error) {
      console.error("오류 발생:", error);
    }
  };

  // 컴포넌트가 마운트될 때 친구 목록 가져오기
  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="friend-list-container">
      <div className="friend-list-header">
        <h3>친구 목록</h3>
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
    </div>
  );
};

export default FriendList;
