import React from "react";
import { DreamselfProfile, TimeOfDayPhase } from "../types";

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  // we don't need the EnvironmentId type here – a string is enough
  environmentId: string;
  encounterItemName: string | null;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  profile, // kept for future use
  phase,
  environmentId,
  encounterItemName,
}) => {
  const phaseClass = `world-lane--phase-${phase}`;
  const envClass = `world-lane--env-${environmentId}`;

  return (
    <div className={`world-lane ${phaseClass} ${envClass}`}>
      {/* background sky */}
      <div className="world-lane-sky" />

      {/* parallax scrolling ground */}
      <div className="world-lane-ribbon world-lane-ribbon--back" />
      <div className="world-lane-ribbon world-lane-ribbon--front" />

      {/* figure + light cone */}
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