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
      <div className="start-screen-left">
  {/* Main title */}
  <h1 className="start-screen-title">DREAM</h1>

  {/* Single subtitle in the small “kicker” style */}
  <div className="start-screen-subtitle">
    DYNAMIC REALITY ENGINEERED APPAREL MACHINE
  </div>

  {/* Menu */}
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
      disabled={!canContinue}
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
