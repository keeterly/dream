import React from "react";
import "./start.css";

export const SettingsModal = ({ onClose }) => {
  return (
    <div className="start-settings-backdrop" onClick={onClose}>
      <div className="start-settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="start-settings-close" onClick={onClose}>×</button>

        <h2 className="settings-title">Settings</h2>

        <div className="settings-section">
          <label>Audio Volume</label>
          <input type="range" min="0" max="100" />
        </div>

        <div className="settings-section">
          <label>Graphics Quality</label>
          <select>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

      </div>
    </div>
  );
};
