import React, { createContext, useState, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
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

    setAuthState({
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

    setAuthState({
      token: null,
      userId: null,
      userEmail: null,
      userRole: null,
      userName: null,
      isAuthenticated: false,
    });
  }, []);

  const updateUserName = useCallback((newName) => {
    localStorage.setItem("userName", newName);
    setAuthState((prevState) => ({
      ...prevState,
      userName: newName,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...authState, onLogin, onLogout, updateUserName }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
