import React from "react";
import { DreamselfProfile, TimeOfDayPhase } from "../types";

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  environmentId: string;
  encounterItemName: string | null;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  profile, // reserved for future use (robe variants, etc.)
  phase,
  environmentId,
  encounterItemName,
}) => {
  const phaseClass = `world-lane--phase-${phase}`;
  const envClass = `world-lane--env-${environmentId}`;

  return (
    <div className={`world-lane ${phaseClass} ${envClass}`}>
      {/* sky + stars */}
      <div className="world-lane-sky" />
      <div className="world-lane-stars" />

      {/* distant hills / ruins */}
      <div className="world-lane-backdrop world-lane-backdrop--far" />
      <div className="world-lane-backdrop world-lane-backdrop--near" />

      {/* scrolling ground / path */}
      <div className="world-lane-ground world-lane-ground--back" />
      <div className="world-lane-ground world-lane-ground--front" />

      {/* character */}
      <div className="world-lane-figure">
        <div className="world-lane-figure-shadow" />
        <div className="world-lane-figure-body">
          <div className="world-lane-figure-hood">
            <div className="world-lane-figure-face" />
          </div>
        </div>
      </div>

      {/* moon */}
      <div className="world-lane-moon" />

      {/* encounter pulse under feet */}
      {encounterItemName && (
        <div className="world-lane-encounter-pulse" aria-hidden={true} />
      )}
    </div>
  );
};

export default WorldLane;