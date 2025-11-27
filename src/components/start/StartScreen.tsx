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
          <h1 className="start-screen-logo">DREAM</h1>
          <p className="start-screen-tagline">
            Dynamic Reality Engineered Apparel Machine
          </p>
        </div>

        <div className="start-screen-menu">
          <button
            type="button"
            className="start-screen-btn start-screen-btn--primary"
            onClick={onNewGame}
          >
            New Game
          </button>

          <button
            type="button"
            className="start-screen-btn"
            onClick={onContinue}
            disabled={!hasExistingProfile}
          >
            Continue
          </button>

          <button
            type="button"
            className="start-screen-btn"
            onClick={onOpenSettings}
          >
            Settings
          </button>
        </div>
      </div>
    </section>
  );
};
