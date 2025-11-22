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
 * Available loot sprite files in /public/items/foundItems
 * (filenames only, no paths).
 */
const LOOT_SPRITES = [
  "faceted_diamond.svg",
  "low_gem_prison.svg",
  "rough_cut_stone.svg",
  "short_chunky_crystal.svg",
  "split_crystal.svg",
  "glass_relic.svg", // new dedicated art
];

/**
 * Explicit overrides for specific item display names.
 * e.g. "Glass Relic" should always use glass_relic.svg.
 */
const LOOT_FILE_OVERRIDES: Record<string, string> = {
  "Glass Relic": "glass_relic.svg",
};

/**
 * Deterministically pick a sprite for a given item name so that
 * the same relic name always maps to the same SVG.
 */
function pickLootSprite(encounterItemName: string | null): string | null {
  if (!encounterItemName) return null;

  const trimmed = encounterItemName.trim();

  // 1. Explicit override if we have one
  const override = LOOT_FILE_OVERRIDES[trimmed];
  if (override) return override;

  // 2. Stable hash → index into LOOT_SPRITES
  let hash = 0;
  for (let i = 0; i < trimmed.length; i += 1) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) | 0;
  }

  const index = Math.abs(hash) % LOOT_SPRITES.length;
  return LOOT_SPRITES[index];
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isWalking = true,
}) => {
  // For GitHub Pages this will be "/dream/" – Vite serves everything under
  // /public at the root, so our assets are at:
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

  const lootSprite = pickLootSprite(encounterItemName);
  const lootSpriteSrc = lootSprite
    ? `${baseUrl}items/foundItems/${lootSprite}`
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

      {/* Loot icon on the ribbon: slides in from the right toward the avatar */}
      {lootSpriteSrc && (
        <img
          className="world-lane-loot"
          src={lootSpriteSrc}
          alt={encounterItemName ?? "Found item"}
        />
      )}
    </div>
  );
};

export default WorldLane;
