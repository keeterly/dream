import React from "react";

interface WorldLaneProps {
  profile: unknown | null;
  phase: string;
  environmentId: string;
  encounterItemName: string | null;
  isEncounterActive?: boolean;
}

// Hard-coded parallax layers for dusk_valley
// depth: 0 = far back, 4 = foreground
const PARALLAX_LAYERS = [
  {
    file: "layer_01.png",
    depth: 0,
    duration: 220,
    opacity: 0.4,
    blur: 1.6,
  },
  {
    file: "layer_02.png",
    depth: 1,
    duration: 160,
    opacity: 0.7,
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
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
}) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    isEncounterActive ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div className="world-lane-inner">
        {/* Parallax art layers */}
        {PARALLAX_LAYERS.map((layer) => (
          <div
            key={layer.file}
            className={`world-lane-layer world-lane-layer--depth-${layer.depth}`}
            style={{
              backgroundImage: `url(${baseUrl}world/${environmentId}/${layer.file})`,
              backgroundSize: "130% auto",
              willChange: "background-position",
              animationName: "world-lane-art-scroll",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDuration: `${layer.duration}s`,
              opacity: layer.opacity,
              filter: layer.blur ? `blur(${layer.blur}px)` : "none",
              zIndex: layer.depth,
            }}
          />
        ))}

        {/* The actual “ribbon” strip the character walks on */}
        <div className="world-lane-ribbon" />
      </div>

      {/* Loot encounter: crystal + pulse in front of the avatar */}
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
