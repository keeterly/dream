// src/components/start/StartScreen.tsx
import React from "react";

interface StartScreenProps {
  hasExistingProfile: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onOpenSettings: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  hasExistingProfile,
  onNewGame,
  onContinue,
  onOpenSettings,
}) => {
  return (
    <section className="start-screen">
      <div className="start-screen-inner">
        <div className="start-screen-title-block">
          <p className="start-screen-eyebrow">Dynamic Reality Engine</p>

          <h1 className="start-screen-logo">DREAM</h1>

          <p className="start-screen-tagline">
            Dynamic Reality Engineered Apparel Machine
          </p>
        </div>

        <div className="start-screen-menu">
          <button
            type="button"
            className="btn start-screen-btn-primary"
            onClick={onNewGame}
          >
            New Game
          </button>

          <button
            type="button"
            className={
              "btn btn--ghost start-screen-btn" +
              (!hasExistingProfile ? " start-screen-btn--disabled" : "")
            }
            onClick={onContinue}
            disabled={!hasExistingProfile}
          >
            Continue
          </button>

          <button
            type="button"
            className="btn btn--ghost start-screen-btn"
            onClick={onOpenSettings}
          >
            Settings
          </button>
        </div>
      </div>
    </section>
  );
};
