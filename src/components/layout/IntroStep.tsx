// src/components/layout/IntroStep.tsx
import React from "react";

interface IntroStepProps {
  onBegin: () => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({ onBegin }) => {
  return (
    <section className="app-screen app-screen-intro">
      <div className="app-panel intro-card intro-card--glass intro-card--centered">
        <p className="intro-tagline">Enter the Dream</p>

        <h2 className="intro-title">Cave of Departure</h2>

        <p className="intro-copy">
          In D.R.E.A.M., you&rsquo;ll craft a symbolic self&mdash;your Dreamself
          &mdash;and walk a ribbon between worlds: ruins at dusk, nocturnal
          ridges, shorelines at morning, and cities that never fully wake.
        </p>

        <p className="intro-copy">
          Your choices will shape your archetype, your aetheric signature,
          and the relics that respond to you.
        </p>

        <div className="intro-meta">
          <span className="chip chip--small chip--ghost">Chapter 01</span>
          <span className="chip chip--small chip--ghost">Dreamself Creation</span>
        </div>

        <div className="intro-actions">
          <button
            type="button"
            className="btn"
            onClick={onBegin}
          >
            Begin Dreamself Creation
          </button>
        </div>
      </div>
    </section>
  );
};
