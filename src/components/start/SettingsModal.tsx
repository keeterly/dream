import React from "react";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  return (
    <div className="world-panel-modal-backdrop" onClick={onClose}>
      <div
        className="world-panel-modal start-settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="inventory-modal-close"
          onClick={onClose}
          aria-label="Close settings"
        >
          ×
        </button>

        <div className="world-panel">
          <div className="world-panel-header">
            <div className="world-panel-header-left">
              <span className="world-panel-header-eyebrow">System</span>
              <span className="world-panel-header-title">Settings</span>
            </div>
          </div>

          <div className="world-panel-body">
            <p className="world-panel-copy">
              Settings are coming soon. For now this is just a placeholder
              modal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
