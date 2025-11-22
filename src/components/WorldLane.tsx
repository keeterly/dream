// src/components/world/WorldLane.tsx
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
 * Explicit mapping from encounter names -> sprite files.
 * This guarantees that "Glass Relic" always points at glass_relic.svg
 * instead of going through the hash / randomiser.
 */
const NAMED_SPRITES: Record<string, string> = {
  "glass relic": "glass_relic.svg",
  "aether sigil": "faceted_diamond.svg",
  "shadow thread": "split_crystal.svg",
  "bloom charm": "short_chunky_crystal.svg",
};

// Fallback pool used for anything we don't explicitly name above.
const LOOT_SPRITES = [
  "faceted_diamond.svg",
  "low_gem_prison.svg",
  "rought_cut_stone.svg",
  "short_chunky_crystal.svg",
  "split_crystal.svg",
  "glass_relic.svg",
];

function getLootSpriteForName(name: string | null): string | null {
  if (!name) return null;

  const normalized = name.trim().toLowerCase();

  // 1. Explicit mapping first (fixes the Glass Relic issue).
  if (normalized in NAMED_SPRITES) {
    return NAMED_SPRITES[normalized];
  }

  // 2. Hash-based mapping for everything else, stable per name.
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }

  const index = hash % LOOT_SPRITES.length;
  return LOOT_SPRITES[index];
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
  isWalking = true,
}) => {
  // For GitHub Pages this will be "/dream/" – Vite serves everything under
  // /public at the root, so our SVGs are at:
  //   <baseUrl>items/foundItems/glass_relic.svg
  const baseUrl = import.meta.env.BASE_URL || "/";

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    !isWalking ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const lootSprite = getLootSpriteForName(encounterItemName);
  const lootSrc =
    lootSprite != null ? `${baseUrl}items/foundItems/${lootSprite}` : null;

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

      {/* Loot silhouette on the ground in front of the Dreamself.
          Hidden once the encounter is active. */}
      {encounterItemName && !isEncounterActive && lootSrc && (
        <div className="world-lane-loot" aria-hidden="true">
          <div className="world-lane-loot-shadow" />
          <img
            src={lootSrc}
            alt={encounterItemName ?? "Found object"}
            className="world-lane-loot-image"
          />
        </div>
      )}
    </div>
  );
};

export default WorldLane;