import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  const onLogin = (token, id, role, name) => {
    try {
      setIsLoggedIn(true);
      setToken(token);
      setUserId(id);
      setUserRole(role);
      setUserName(name);

      localStorage.setItem("token", token);
      localStorage.setItem("userId", id);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);
    } catch (error) {
      console.error("로그인 처리 중 오류:", error);
    }
  };

  const onLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUserId(null);
    setUserRole(null);
    setUserName(null);

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    navigate("/");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    const savedUserRole = localStorage.getItem("userRole");
    const savedUserName = localStorage.getItem("userName");

    if (savedToken && savedUserId && savedUserRole && savedUserName) {
      setIsLoggedIn(true);
      setToken(savedToken);
      setUserId(savedUserId);
      setUserRole(savedUserRole);
      setUserName(savedUserName);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        userId,
        userRole,
        userName,
        setUserName,
        onLogin,
        onLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
