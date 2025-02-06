import React, { createContext, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: null,
    userEmail: null,
    userRole: null,
    userNickname: null,
  });

  const onLogin = useCallback((token) => {
    try {
      const decodedToken = jwtDecode(token);
      const { userId, userEmail, userRole, userNickname } = decodedToken;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userNickname", userNickname);

      setUserInfo({
        userId,
        userEmail,
        userRole,
        userNickname,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("토큰 디코딩 실패:", error);
      setIsAuthenticated(false);
    }
  }, []);

  const onLogout = useCallback(() => {
    localStorage.clear();
    setUserInfo({
      userId: null,
      userEmail: null,
      userRole: null,
      userNickname: null,
    });
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userInfo, onLogin, onLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
