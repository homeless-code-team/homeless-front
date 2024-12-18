import React, { useState } from "react";
import "./MenuBar.css";

const MenuBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    if (window.electron) {
      window.electron.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.maximize();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (window.electron) {
      window.electron.close();
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
