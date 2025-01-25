import React, { useEffect, useState } from "react";
import "./FriendList.css";
import axios from "axios";
import axiosInstance from "../configs/axios-config";
import "./serverInviteList.css";
import Swal from "sweetalert2";

const FriendList = ({ getServerList }) => {
  const token = localStorage.getItem("token");
  const [inviteServerList, setInviteServerList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

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

    console.log(res.data.result);

    setInviteServerList(res.data.result);
  };

  const acceptanceInvite = async (serverId, addStatus) => {
    console.log(serverId);

    const res = await axiosInstance.post(
      `${process.env.REACT_APP_API_BASE_URL}/server/acceptanceInvite`,
      {
        serverId, // 서버 ID
        addStatus, // AddStatus (e.g., 'APPROVE' or 'REJECTED')
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // 인증 헤더
        },
      }
    );

    console.log(res);
    console.log(res.data.statusMessage);

    if (res.status === 200) {
      Swal.fire(res.data.statusMessage);
      getServerList();
      fetchInviteServer();
    } else {
      Swal.fire("서버 가입 수락중 문제가 발생했습니다.");
      getServerList();
    }
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
            {inviteServerList.serverImg && (
              <img className="server-img" src={server.serverImg} alt="asd" />
            )}
            <span>{server.title}</span>
          </div>
          <button onClick={() => acceptanceInvite(server.serverId, "ACCEPT")}>
            수락
          </button>
          <button onClick={() => acceptanceInvite(server.serverId, "REJECTED")}>
            거절
          </button>
        </div>
      ))}
    </div>
  );
};

export default FriendList;
