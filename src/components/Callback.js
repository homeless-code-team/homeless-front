import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AuthContext from "../context/AuthContext.js";

const Callback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);

                // 사용자 정보 저장
                const userInfo = {
                    token,
                    email: decoded.sub,
                    userId: decoded.user_id,
                    role: decoded.role,
                    nickname: decoded.nickname,
                };
                onLogin(token); // 로그인 상태 업데이트
                // 로컬 스토리지에 저장
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                localStorage.setItem("token", token);

                // 로그인 후 메인 페이지 이동
                navigate("/", { replace: true });
            } catch (error) {
                console.error("JWT 디코딩 실패:", error);
                navigate("/sign-in"); // 오류 발생 시 로그인 페이지로 이동
            }
        } else {
            navigate("/sign-in"); // JWT가 없으면 로그인 페이지로 이동
        }
    }, [location, navigate]);

    return <p>로그인 중...</p>;
};

export default Callback;
