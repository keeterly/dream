import React from "react";
import {
  DreamselfProfile,
  TimeOfDayPhase,
  EnvironmentId,
} from "../types";

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  environmentId: EnvironmentId;
  encounterItemName: string | null;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
}) => {
  const phaseClass = `world-lane--phase-${phase}`;
  const envClass = `world-lane--env-${environmentId}`;

  return (
    <div className={`world-lane ${phaseClass} ${envClass}`}>
      {/* sky / background */}
      <div className="world-lane-sky" />

      {/* scrolling ground ribbons */}
      <div className="world-lane-ribbon world-lane-ribbon--back" />
      <div className="world-lane-ribbon world-lane-ribbon--front" />

      {/* figure + light cone (matches what you see in the screenshot) */}
      <div className="world-lane-orb" />
      <div className="world-lane-cone" />
      <div className="world-lane-figure" />

      {/* subtle pulse when an item is being encountered */}
      {encounterItemName && (
        <div className="world-lane-encounter-pulse" aria-hidden="true" />
      )}
    </div>
  );
};

export default WorldLane;