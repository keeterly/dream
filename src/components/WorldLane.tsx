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
 * Map the in-game relic names to the actual SVG filenames in
 * public/items/foundItems.
 *
 * Keys are LOWER-CASED display names.
 */
const LOOT_FILENAME_BY_NAME: Record<string, string> = {
  "glass relic": "glass_relic.svg",
  "ember token": "faceted_diamond.svg",
  "shadow thread": "low_gem_prison.svg",
  "aether sigil": "split_crystal.svg",
  "bloom charm": "short_chunky_crystal.svg",
  "lonely pebble": "rought_cut_stone.svg", // note: matches your file name
};

function makeSlugFileName(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") + ".svg"
  );
}

/**
 * Resolve the full sprite URL for the current encounter item.
 * 1. Try explicit mapping (for all the current relics).
 * 2. Fallback to slug-based filename for any future items,
 *    assuming you drop a matching SVG in the folder.
 */
function getLootSpriteUrl(
  encounterItemName: string | null,
  baseUrl: string
): string | null {
  if (!encounterItemName) return null;

  const key = encounterItemName.trim().toLowerCase();
  const explicitFile = LOOT_FILENAME_BY_NAME[key];
  const fileName = explicitFile ?? makeSlugFileName(encounterItemName);

  const normalizedBase =
    baseUrl === "" || baseUrl === "/"
      ? "/"
      : baseUrl.endsWith("/")
      ? baseUrl
      : `${baseUrl}/`;

  return `${normalizedBase}items/foundItems/${fileName}`;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
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

  const lootSpriteUrl = getLootSpriteUrl(encounterItemName, baseUrl);

  // Approach vs pickup state:
  //  - approach: sliding in from off-screen
  //  - pickup: play pickup animation instead of instantly vanishing
  const lootStateClass =
    lootSpriteUrl && encounterItemName
      ? isEncounterActive
        ? "world-lane-loot--pickup"
        : "world-lane-loot--approach"
      : "";

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

      {/* Loot icon on the ribbon */}
      {lootSpriteUrl && encounterItemName && (
        <div
          className={`world-lane-loot ${lootStateClass}`}
          aria-hidden="true"
        >
          <div className="world-lane-loot-shadow" />
          <img
            src={lootSpriteUrl}
            alt={encounterItemName}
            className="world-lane-loot-image"
          />
        </div>
      )}
    </div>
  );
};

export default WorldLane;
