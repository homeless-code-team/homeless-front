import React, { createContext, useState, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    userId: localStorage.getItem("userEmail"),
    userRole: localStorage.getItem("userRole"),
    userName: localStorage.getItem("userName"),
    isAuthenticated: !!localStorage.getItem("token"),
  });

  const onLogin = useCallback((token, email, role, name) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name);

    setAuth({
      token,
      userId: email,
      userRole: role,
      userName: name,
      isAuthenticated: true,
    });
  }, []);

  const onLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    setAuth({
      token: null,
      userId: null,
      userRole: null,
      userName: null,
      isAuthenticated: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
