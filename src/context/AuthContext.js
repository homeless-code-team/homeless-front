import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  const onLogin = (token, email, id, role, name) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);
      localStorage.setItem("userId", userId);

      setIsLoggedIn(true);
      setToken(token);
      setUserId(id);
      setUserEmail(email);
      setUserRole(role);
      setUserName(name);
    } catch (error) {
      console.error("로그인 처리 중 오류:", error);
    }
  };

  const onLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUserId(null);
    setUserEmail(null);
    setUserRole(null);
    setUserName(null);

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    navigate("/");
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    const savedUserEmail = localStorage.getItem("userEmail");
    const savedUserRole = localStorage.getItem("userRole");
    const savedUserName = localStorage.getItem("userName");

    if (
      savedToken &&
      savedUserEmail &&
      savedUserId &&
      savedUserRole &&
      savedUserName
    ) {
      setIsLoggedIn(true);
      setToken(savedToken);
      setUserEmail(savedUserEmail);
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
        userEmail,
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
