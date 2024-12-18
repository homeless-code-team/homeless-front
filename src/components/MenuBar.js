import React from "react";
import "./MenuBar.css";

const MenuBar = () => {
  const handleClose = async () => {
    console.log("windowControls:", window.windowControls);
    if (window.windowControls) {
      try {
        await window.windowControls.closeWindow();
      } catch (error) {
        console.error("Error closing window:", error);
      }
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
