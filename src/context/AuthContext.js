import React, { createContext, useState } from "react";

const AuthContext = createContext({
  token: null,
  userId: null,
  userRole: null,
  userName: null,
  isAuthenticated: false,
  onLogin: () => {},
  onLogout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    userId: localStorage.getItem("userId") || null,
    userRole: localStorage.getItem("userRole") || null,
    userName: localStorage.getItem("userName") || null,
    isAuthenticated: !!localStorage.getItem("token"),
  });

  const handleLogin = (token, id, role, name) => {
    setAuth({
      token,
      userId: id,
      userRole: role,
      userName: name,
      isAuthenticated: true,
    });

    localStorage.setItem("token", token);
    localStorage.setItem("userId", id);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name);
  };

  const handleLogout = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }
    if (localStorage.getItem("userId")) {
      localStorage.removeItem("userId");
    }
    if (localStorage.getItem("userRole")) {
      localStorage.removeItem("userRole");
    }
    if (localStorage.getItem("userName")) {
      localStorage.removeItem("userName");
    }

    setAuth({
      token: null,
      userId: null,
      userRole: null,
      userName: null,
      isAuthenticated: false,
    });
  };

  const contextValue = {
    ...auth,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
