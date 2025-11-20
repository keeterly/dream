import React from "react";

interface AppHeaderProps {
  screen: "intro" | "questions" | "summary" | "world";
}

export const AppHeader: React.FC<AppHeaderProps> = ({ screen }) => {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-title-block">
          <div className="app-logo-mark" />
          <div className="app-title-text">
            <h1 className="app-title">D.R.E.A.M.</h1>
            <p className="app-subtitle">A ribbon between worlds</p>
          </div>
        </div>
        <div className="app-header-screen-indicator">
          <span className="app-header-pill">
            {screen === "intro" && "Cave of Departure"}
            {screen === "questions" && "Dreamself Creation"}
            {screen === "summary" && "Dreamself Revealed"}
            {screen === "world" && "The Scrolling World"}
          </span>
        </div>
      </div>
    </header>
  );
};
