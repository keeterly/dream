import React from "react";
import "./start.css";

interface StartScreenProps {
  hasProfile: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  hasProfile,
  onNewGame,
  onContinue,
  onSettings,
}) => {
  return (
    <div className="start-screen">
      <div className="start-screen-inner start-fade-in">

        <h1 className="start-title">D R E A M</h1>
        <p className="start-subtitle">
          Dynamic Reality Engineered Apparel Machine
        </p>

        <div className="start-buttons start-buttons-fade">
          {hasProfile && (
            <button className="start-btn" onClick={onContinue}>
              Continue
            </button>
          )}

          <button className="start-btn" onClick={onNewGame}>
            {hasProfile ? "New Game" : "Begin"}
          </button>

          <button className="start-btn" onClick={onSettings}>
            Settings
          </button>
        </div>

      </div>
    </div>
  );
};
