import React from "react";
import { DreamselfProfile, TimeOfDayPhase } from "../types";

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  environmentId: string;
  encounterItemName: string | null;
}

// Hard-coded parallax layers for dusk_valley
// Back -> front
const PARALLAX_LAYERS = [
  {
    file: "layer_01.png", // sky / stars / moon
    depth: 1,
    duration: 160, // slowest (furthest back)
  },
  {
    file: "layer_02.png",
    depth: 2,
    duration: 110,
  },
  {
    file: "layer_03.png",
    depth: 3,
    duration: 80,
  },
  {
    file: "layer_04.png",
    depth: 4,
    duration: 55,
  },
  {
    file: "layer_05.png", // ground / path
    depth: 5,
    duration: 32, // fastest (foreground)
  },
];

const WorldLane: React.FC<WorldLaneProps> = ({
  // profile,
  // phase,
  // environmentId,
  encounterItemName,
}) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <div className="world-lane">
      {/* Parallax art layers */}
      {PARALLAX_LAYERS.map((layer) => (
        <div
          key={layer.file}
          className={`world-lane-layer world-lane-layer--depth-${layer.depth}`}
          style={{
            backgroundImage: `url("${baseUrl}assets/parallax/dusk_valley/${layer.file}")`,
            animationDuration: `${layer.duration}s`,
          }}
        />
      ))}

      {/* Character silhouette */}
      <div className="world-lane-figure">
        <div className="world-lane-figure-shadow" />
        <div className="world-lane-figure-body">
          <div className="world-lane-figure-hood">
            <div className="world-lane-figure-face" />
          </div>
        </div>
      </div>

      {/* Loot encounter pulse under feet */}
      {encounterItemName && (
        <div className="world-lane-encounter-pulse" aria-hidden="true" />
      )}
    </div>
  );
};

export default WorldLane;
