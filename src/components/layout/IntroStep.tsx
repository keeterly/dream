import React from "react";

interface IntroStepProps {
  onBegin: () => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({ onBegin }) => {
  return (
    <section className="app-screen app-screen-intro">
      <div className="intro-card">
        <div className="intro-copy">
          <h2 className="intro-title">Enter the dream.</h2>
          <p className="intro-body">
            In D.R.E.A.M., you’ll craft a symbolic self — a Dreamself — and walk
            a ribbon between worlds: ruins at dusk, nocturnal ridges, shorelines
            at morning, and cities that never fully wake.
          </p>
          <p className="intro-body">
            Your choices will shape your archetype, your aetheric signature, and
            the relics that respond to you.
          </p>
          <button className="primary-button" onClick={onBegin}>
            Begin Dreamself Creation
          </button>
        </div>
        <div className="intro-hero">
          <div className="intro-hero-orb" />
          <div className="intro-hero-figure" />
          <p className="intro-caption">“All journeys begin in the cave.”</p>
        </div>
      </div>
    </section>
  );
};
