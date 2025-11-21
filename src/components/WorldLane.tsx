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

/**
 * SVGs you added under:
 *   public/assets/items/foundItems/
 *
 * NOTE: names must match the files exactly.
 */
const FOUND_ITEM_SPRITES = [
  "faceted_diamond.svg",
  "low_gem_prison.svg",
  "rought_cut_stone.svg",
  "short_chunky_crystal.svg",
  "split_crystal.svg",
] as const;

/**
 * Deterministically pick a sprite based on the encounter's name.
 * There is ALWAYS a fallback so something is drawn.
 */
function getSpriteForEncounter(name: string | null): string {
  if (!name) {
    return FOUND_ITEM_SPRITES[0];
  }

  const n = name.toLowerCase();

  // A few hand-tuned mappings so the vibe matches the name
  if (n.includes("glass") || n.includes("sigil")) {
    return FOUND_ITEM_SPRITES[0]; // faceted_diamond
  }
  if (n.includes("ember") || n.includes("token")) {
    return FOUND_ITEM_SPRITES[1]; // low_gem_prison
  }
  if (n.includes("stone") || n.includes("rock") || n.includes("ore")) {
    return FOUND_ITEM_SPRITES[2]; // rought_cut_stone
  }
  if (n.includes("thread") || n.includes("charm") || n.includes("weave")) {
    return FOUND_ITEM_SPRITES[3]; // short_chunky_crystal
  }

  // Fallback: hash the name into the sprite array so it’s stable per item
  const hash = Array.from(n).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FOUND_ITEM_SPRITES[hash % FOUND_ITEM_SPRITES.length];
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
  isWalking = true,
}) => {
  // For GitHub Pages this will be "/dream/" – Vite serves everything under
  // /public at the root, so our PNGs/SVGs are at:
  //   <baseUrl>assets/parallax/<environmentId>/layer_01.png
  //   <baseUrl>assets/items/foundItems/<sprite>.svg
  const baseUrl = import.meta.env.BASE_URL || "/";

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    !isWalking ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Pick a sprite for the *current* encounter (even if name is weird)
  const itemSpriteFile = getSpriteForEncounter(encounterItemName);
  const itemSpritePath = `${baseUrl}assets/items/foundItems/${itemSpriteFile}`;

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

      {/* Loot encounter: pulse + sprite in front of the avatar */}
      {isEncounterActive && (
        <>
          <div className="world-lane-encounter-pulse" aria-hidden="true" />
          <div
            className="world-lane-crystal"
            aria-hidden="true"
            style={{
              backgroundImage: `url("${itemSpritePath}")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
            }}
          />
        </>
      )}
    </div>
  );
};

export default WorldLane;
