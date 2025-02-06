import React, { useEffect, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { provider } = useParams();
  const { onLogin } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        alert("로그인 중 오류가 발생했습니다.");
        navigate("/", { replace: true });
        return;
      }

      if (!code) {
        alert("인증 코드가 없습니다.");
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/user-service/api/v1/oauth2/callback/${provider}`,
          { params: { code } }
        );

        if (response.data.status === "OK") {
          const token = response.data.data;
          onLogin(token);
          navigate("/", { replace: true });
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        if (error.response?.status === 409) {
          alert("이미 존재하는 이메일입니다.");
        } else {
          alert("로그인 처리 중 오류가 발생했습니다.");
        }
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate, onLogin, location, provider]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div>처리 중...</div>
    </div>
  );
};

export default Callback;
