import React from "react";
import { DreamselfProfile, TimeOfDayPhase } from "../types";

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  environmentId: string;
  encounterItemName: string | null;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  profile, // reserved for later
  phase,
  environmentId,
  encounterItemName,
}) => {
  const phaseClass = `world-lane--phase-${phase}`;
  const envClass = `world-lane--env-${environmentId}`;

  return (
    <div className={`world-lane ${phaseClass} ${envClass}`}>
      {/* sky + distant silhouettes */}
      <div className="world-lane-sky" />
      <div className="world-lane-ridge world-lane-ridge--back" />
      <div className="world-lane-ridge world-lane-ridge--mid" />

      {/* scrolling ground / ribbon */}
      <div className="world-lane-path world-lane-path--back" />
      <div className="world-lane-path world-lane-path--front" />

      {/* character */}
      <div className="world-lane-figure" />

      {/* subtle moon / glow over the character */}
      <div className="world-lane-moon" />

      {/* encounter pulse */}
      {encounterItemName && (
        <div className="world-lane-encounter-pulse" aria-hidden="true" />
      )}
    </div>
  );
};

export default WorldLane;