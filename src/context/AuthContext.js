import React, { createContext, useState, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState({
    token: localStorage.getItem("token"),
    userId: localStorage.getItem("userId"),
    userEmail: localStorage.getItem("userEmail"),
    userRole: localStorage.getItem("userRole"),
    userName: localStorage.getItem("userName"),
    isAuthenticated: !!localStorage.getItem("token"),
  });

  const onLogin = useCallback((token, email, role, name, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name);
    localStorage.setItem("userId", userId);

    setIsAuthenticated({
      token,
      userId,
      userEmail: email,
      userRole: role,
      userName: name,
      isAuthenticated: true,
    });
  }, []);

  const onLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    setIsAuthenticated({
      token: null,
      userId: null,
      userEmail: null,
      userRole: null,
      userName: null,
      isAuthenticated: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...isAuthenticated, setIsAuthenticated, onLogin, onLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
