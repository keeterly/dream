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

// Canonical mapping from encounter name -> sprite file
const LOOT_SPRITES = [
  { key: "glass_relic", file: "glass_relic.svg" },
  { key: "faceted_diamond", file: "faceted_diamond.svg" },
  { key: "low_gem_prison", file: "low_gem_prison.svg" },
  { key: "rough_cut_stone", file: "rough_cut_stone.svg" },
  { key: "short_chunky_crystal", file: "short_chunky_crystal.svg" },
  { key: "split_crystal", file: "split_crystal.svg" },
] as const;

type LootKey = (typeof LOOT_SPRITES)[number]["key"];

// Explicit overrides for weird names
const NAMED_SPRITES: Record<string, LootKey> = {
  "Glass Relic": "glass_relic",
};

function getLootSpriteForName(
  encounterItemName: string | null,
  baseUrl: string
): string | null {
  if (!encounterItemName) return null;

  const trimmed = encounterItemName.trim();

  // 1) Hard-coded mapping
  const explicitKey = NAMED_SPRITES[trimmed];
  const explicitSprite = LOOT_SPRITES.find((s) => s.key === explicitKey);
  if (explicitSprite) {
    return `${baseUrl}items/foundItems/${explicitSprite.file}`;
  }

  // 2) Slugged key mapping, e.g. "Bloom Charm" -> "bloom_charm"
  const slug = trimmed
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const guessedSprite = LOOT_SPRITES.find((s) => s.key === slug);
  if (guessedSprite) {
    return `${baseUrl}items/foundItems/${guessedSprite.file}`;
  }

  // 3) Fallback assume a literal file name
  return `${baseUrl}items/foundItems/${slug}.svg`;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive = false,
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

  const lootSpriteSrc = getLootSpriteForName(encounterItemName, baseUrl);
  // IMPORTANT: we now show loot any time there is an encounterItemName.
  // It will disappear only when the parent clears encounterItemName.
  const showLoot = Boolean(lootSpriteSrc && encounterItemName);

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

      {/* Loot icon on the ribbon.
          - Slides in from the right (CSS).
          - Stays visible when the encounter becomes active.
          - When isEncounterActive flips to true we add a pickup class so CSS
            can animate it into the Dreamself / inventory. */}
      {showLoot && (
        <img
          className={
            "world-lane-loot" +
            (isEncounterActive ? " world-lane-loot--pickup" : "")
          }
          src={lootSpriteSrc!}
          alt={encounterItemName ?? "Found item"}
          aria-hidden={!encounterItemName}
        />
      )}
    </div>
  );
};

export default WorldLane;
