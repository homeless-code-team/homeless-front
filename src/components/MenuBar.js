import React, { useState, useEffect, useContext } from "react";
import "./MenuBar.css";
import AuthContext from "../context/AuthContext.js";

const MenuBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { onLogout } = useContext(AuthContext);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.WindowControls) {
        const maximized = await window.WindowControls.isMaximized();
        setIsMaximized(maximized);
      }
    };
    checkMaximized();

    // 윈도우 종료 전 이벤트 리스너 등록
    if (window.WindowControls) {
      window.WindowControls.onBeforeClose(() => {
        localStorage.removeItem("token");
        onLogout();
      });
    }
  }, [onLogout]);

  const handleClose = async () => {
    if (window.WindowControls) {
      localStorage.removeItem("token");
      onLogout();
      await window.WindowControls.closeWindow();
    }
  };

  const handleMinimize = async () => {
    if (window.WindowControls) {
      await window.WindowControls.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if (window.WindowControls) {
      const maximized = await window.WindowControls.maximizeWindow();
      setIsMaximized(maximized);
    }
  };

  return (
    <div className="menu-bar">
      <div className="menu-title">Homeless Code</div>
      <div className="window-controls">
        <button className="control-button minimize" onClick={handleMinimize}>
          ─
        </button>
        <button className="control-button maximize" onClick={handleMaximize}>
          {isMaximized ? "❐" : "□"}
        </button>
        <button className="control-button close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
