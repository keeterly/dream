import React from "react";
import type { DreamselfProfile } from "../types";
import type { TimeOfDayPhase } from "../worldItems";

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  environmentId: string;
  encounterItemName: string | null;
}

// Hard-coded parallax layers for dusk_valley
const PARALLAX_LAYERS = [
  {
    file: "layer_01.png",
    depth: 1,
    duration: 160,
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
    file: "layer_05.png",
    depth: 5,
    duration: 32,
  },
];

const WorldLane: React.FC<WorldLaneProps> = ({
  encounterItemName,
}) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <div className="world-lane">
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

      <div className="world-lane-figure">
        <div className="world-lane-figure-shadow" />
        <div className="world-lane-figure-body">
          <div className="world-lane-figure-hood">
            <div className="world-lane-figure-face" />
          </div>
        </div>
      </div>

      {encounterItemName && (
        <div className="world-lane-encounter-pulse" aria-hidden="true" />
      )}
    </div>
  );
};

export default WorldLane;
