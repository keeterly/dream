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
      {/* Background sky */}
      <div className="world-lane-sky" />

      {/* Parallax scrolling ground */}
      <div className="world-lane-ribbon world-lane-ribbon--back" />
      <div className="world-lane-ribbon world-lane-ribbon--front" />

      {/* Character + spotlight */}
      <div className="world-lane-orb" />
      <div className="world-lane-cone" />
      <div className="world-lane-figure" />

      {/* Encounter pulse */}
      {encounterItemName && (
        <div className="world-lane-encounter-pulse" aria-hidden="true" />
      )}
    </div>
  );
};

export default WorldLane;
