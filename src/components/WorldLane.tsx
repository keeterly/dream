// src/components/WorldLane.tsx
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

// Your Nier-style loot SVGs – they live in public/items/foundItems
const LOOT_SPRITES = [
  "faceted_diamond.svg",
  "low_gem_prison.svg",
  "rought_cut_stone.svg",
  "short_chunky_crystal.svg",
  "split_crystal.svg",
];

/**
 * Choose a sprite based on the encounter item name so the same item
 * always feels like “the same little rock/gem”.
 */
function getLootSpriteForName(name: string | null): string | null {
  if (!name) return null;
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % LOOT_SPRITES.length;
  return LOOT_SPRITES[index] ?? null;
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

  const lootSprite = getLootSpriteForName(encounterItemName);

  // URL to the chosen SVG if we have one
  const lootSrc = lootSprite
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

        {/* The actual ribbon the Dreamself stands/walks on */}
        <div className="world-lane-ribbon" />
      </div>

      {/* Loot on the ribbon: grounded, slightly ahead of the avatar */}
      {lootSrc && (
        <div
          className={[
            "world-lane-loot",
            isEncounterActive ? "world-lane-loot--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="world-lane-loot-shadow" aria-hidden="true" />
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
