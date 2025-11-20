import React from "react";

interface WorldLaneProps {
  profile: unknown | null;
  phase: string;
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

const WorldLane: React.FC<WorldLaneProps> = ({ encounterItemName }) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <div className="world-lane">
      {/* Parallax art layers */}
      {PARALLAX_LAYERS.map((layer) => (
        <div
          key={layer.file}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            // visual
            backgroundImage: `url("${baseUrl}assets/parallax/dusk_valley/${layer.file}")`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "0 bottom",
            backgroundSize: "auto 100%",
            // movement
            transform: "translate3d(0,0,0)",
            willChange: "background-position",
            animationName: "world-lane-art-scroll",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDuration: `${layer.duration}s`,
            // depth ordering
            zIndex: layer.depth,
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
