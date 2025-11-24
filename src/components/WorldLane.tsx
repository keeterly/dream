// src/components/WorldLane.tsx
import React from "react";
import { getSpriteForItemName } from "../spriteMap";

interface WorldLaneProps {
  profile: unknown | null;
  phase: string;
  environmentId: string;
  encounterItemName: string | null;
  /** Encounter UI is live (banner, glyph) */
  isEncounterActive?: boolean;
  /** Whether the Dreamself is currently walking (controls parallax scroll) */
  isWalking?: boolean;
  /** Whether the current loot has just been collected (triggers pickup anim) */
  isLootCollected?: boolean;
}

const PARALLAX_LAYERS = [
  { file: "layer_01.png", depth: 1, duration: 70, opacity: 0.4, blur: 1.6 },
  { file: "layer_02.png", depth: 2, duration: 50, opacity: 0.7, blur: 1.0 },
  { file: "layer_03.png", depth: 3, duration: 32, opacity: 0.9, blur: 0.6 },
  { file: "layer_04.png", depth: 4, duration: 22, opacity: 0.95, blur: 0.3 },
  { file: "layer_05.png", depth: 5, duration: 14, opacity: 1.0, blur: 0 },
];

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive = false,
  isWalking = true,
  isLootCollected = false,
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

  // Single source of truth for icons: spriteMap keyed by item name
  const lootSprite = encounterItemName
    ? getSpriteForItemName(encounterItemName)
    : null;

  const lootPath = lootSprite
    ? `${baseUrl}items/foundItems/${lootSprite}`
    : null;

  const lootClassName = [
    "world-lane-loot",
    isEncounterActive ? "world-lane-loot--active" : "world-lane-loot--approach",
    isLootCollected ? "world-lane-loot--pickup" : "",
  ]
    .filter(Boolean)
    .join(" ");

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

      {/* Nier-style loot crystal on the ribbon. */}
      {encounterItemName && lootPath && (
        <div className={lootClassName}>
          <div className="world-lane-loot-shadow" aria-hidden="true" />
          <img
            src={lootPath}
            alt={encounterItemName}
            className="world-lane-loot-image"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default WorldLane;
