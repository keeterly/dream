import React, { useMemo } from "react";

interface WorldLaneProps {
  profile: unknown | null;
  phase: string;
  environmentId: string;
  encounterItemName: string | null;
  isEncounterActive?: boolean;
  /** Whether the Dreamself is currently walking (controls parallax scroll) */
  isWalking?: boolean;
}

const PARALLAX_LAYERS = [
  { file: "layer_01.png", depth: 0, duration: 70, opacity: 0.4, blur: 1.6 },
  { file: "layer_02.png", depth: 1, duration: 50, opacity: 0.7, blur: 1.0 },
  { file: "layer_03.png", depth: 2, duration: 32, opacity: 0.9, blur: 0.6 },
  { file: "layer_04.png", depth: 3, duration: 22, opacity: 0.95, blur: 0.3 },
  { file: "layer_05.png", depth: 4, duration: 14, opacity: 1.0, blur: 0 },
];

// Your new “found item” sprites in /public/items/foundItems
const FOUND_ITEM_SVGS = [
  "items/foundItems/faceted_diamond.svg",
  "items/foundItems/low_gem_prison.svg",
  "items/foundItems/rought_cut_stone.svg",
  "items/foundItems/short_chunky_crystal.svg",
  "items/foundItems/split_crystal.svg",
] as const;

// simple deterministic hash so the same relic name tends
// to give the same icon (but still “feels” random)
function stringHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
  isWalking = true,
}) => {
  // For GitHub Pages this will be "/dream/"
  const baseUrl = import.meta.env.BASE_URL || "/";

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    !isWalking ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Pick which SVG to use for this encounter
  const encounterSpriteSrc = useMemo(() => {
    if (!isEncounterActive || !encounterItemName) return null;

    const idx =
      stringHash(encounterItemName) % FOUND_ITEM_SVGS.length;

    return `${baseUrl}${FOUND_ITEM_SVGS[idx]}`;
  }, [isEncounterActive, encounterItemName, baseUrl]);

  return (
    <div className={rootClassName}>
      <div className="world-lane-inner">
        {/* Parallax art layers */}
        {PARALLAX_LAYERS.map((layer) => {
          const imgPath = `${baseUrl}assets/parallax/${environmentId}/${layer.file}`;
          return (
            <div
              key={layer.file}
              className={`world-lane-layer world-lane-layer--depth-${layer.depth}`}
              style={{
                backgroundImage: `url("${imgPath}")`,
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
          );
        })}

        {/* The actual “ribbon” strip the character walks on */}
        <div className="world-lane-ribbon" />
      </div>

      {/* Loot encounter: pulse + small SVG crystal in front of the avatar */}
      {isEncounterActive && encounterSpriteSrc && (
        <>
          <div className="world-lane-encounter-pulse" aria-hidden="true" />
          <img
            src={encounterSpriteSrc}
            alt=""
            className="world-lane-item"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
};

export default WorldLane;
