import React from "react";

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

// The five SVGs you added under public/items/foundItems
const FOUND_ITEM_SPRITES = [
  "short_chunky_crystal.svg",
  "faceted_diamond.svg",
  "low_gem_prison.svg",
  "split_crystal.svg",
  "rought_cut_stone.svg", // note: matches your filename “rought_cut_stone.svg”
] as const;

type SpriteFile = (typeof FOUND_ITEM_SPRITES)[number];

function pickSpriteFile(encounterItemName: string | null): SpriteFile | null {
  if (!encounterItemName) return null;

  // Simple deterministic hash → index
  const hash = encounterItemName
    .toLowerCase()
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return FOUND_ITEM_SPRITES[hash % FOUND_ITEM_SPRITES.length];
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive = false,
  isWalking = true,
}) => {
  // For GitHub Pages this will be "/dream/" – Vite serves everything under
  // /public at the root, so our PNGs are at:
  //   <baseUrl>assets/parallax/<environmentId>/layer_01.png
  const baseUrl = import.meta.env.BASE_URL || "/";

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    !isWalking ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const spriteFile = pickSpriteFile(encounterItemName);
  const spriteSrc =
    spriteFile != null
      ? `${baseUrl}items/foundItems/${spriteFile}`
      : null;

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

      {/* Loot encounter: pulse + SVG crystal, locked to ribbon center */}
      {isEncounterActive && spriteSrc && (
        <>
          <div className="world-lane-encounter-pulse" aria-hidden="true" />
          <img
            className="world-lane-found-item"
            src={spriteSrc}
            alt={encounterItemName ?? "Found relic"}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              // This is tuned to sit just ahead of the avatar’s feet.
              bottom: "11vh",
              // Force a consistent on-ribbon size regardless of SVG aspect
              height: "8vh",
              maxHeight: "80px",
              width: "auto",
              zIndex: 14,
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </div>
  );
};

export default WorldLane;
