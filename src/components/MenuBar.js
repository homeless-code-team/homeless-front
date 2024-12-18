import React, { useState, useEffect } from "react";
import "./MenuBar.css";

const MenuBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.WindowControls) {
        const maximized = await window.WindowControls.isMaximized();
        setIsMaximized(maximized);
      }
    };
    checkMaximized();
  }, []);

  const handleClose = async () => {
    if (window.WindowControls) {
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
