import React from "react";
import "./MenuBar.css";

const MenuBar = () => {
  const handleClose = async () => {
    if (window.windowControls) {
      window.windowControls.closeWindow();
    }
  };

  return (
    <div className="menu-bar">
      <div className="menu-title">Homeless Code</div>
      <div className="window-controls">
        <button className="control-button close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default MenuBar;
