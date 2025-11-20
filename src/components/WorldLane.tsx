import React from "react";

interface WorldLaneProps {
  profile: unknown | null;
  phase: string;
  environmentId: string;
  encounterItemName: string | null;
}

// Hard-coded parallax layers for dusk_valley
// depth: 0 = far back, 4 = foreground
const PARALLAX_LAYERS = [
  {
    file: "layer_01.png",
    depth: 0,
    duration: 220,
    opacity: 0.7,
    blur: 1.4,
  },
  {
    file: "layer_02.png",
    depth: 1,
    duration: 150,
    opacity: 0.8,
    blur: 1.0,
  },
  {
    file: "layer_03.png",
    depth: 2,
    duration: 110,
    opacity: 0.9,
    blur: 0.6,
  },
  {
    file: "layer_04.png",
    depth: 3,
    duration: 75,
    opacity: 0.95,
    blur: 0.3,
  },
  {
    file: "layer_05.png",
    depth: 4,
    duration: 45,
    opacity: 1,
    blur: 0,
  },
];

const WorldLane: React.FC<WorldLaneProps> = ({
  profile,
  phase,
  environmentId,
  encounterItemName,
}) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  return (
    <div
      className={`world-lane world-lane--${environmentId} world-lane--phase-${phase.toLowerCase()}`}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {/* Parallax art layers */}
      {PARALLAX_LAYERS.map((layer) => (
        <div
          key={layer.file}
          className="world-lane-layer"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("${baseUrl}assets/parallax/dusk_valley/${layer.file}")`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "0 bottom",
            backgroundSize: "130% auto",
            transform: "translate3d(0, 0, 0)",
            willChange: "background-position",
            animationName: "world-lane-art-scroll",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDuration: `${layer.duration}s`,
            opacity: layer.opacity,
            filter: layer.blur ? `blur(${layer.blur}px)` : "none",
            zIndex: layer.depth, // 0–4
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

      {/* Loot encounter: crystal + pulse */}
      {encounterItemName && (
        <>
          <div className="world-lane-encounter-pulse" aria-hidden="true" />
          <div className="world-lane-crystal" aria-hidden="true" />
        </>
      )}
    </div>
  );
};

export default WorldLane;
