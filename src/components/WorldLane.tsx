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

// New: available “found item” sprites (under public/items/foundItems)
const FOUND_ITEM_SPRITES = [
  { path: "items/foundItems/faceted_diamond.svg", alt: "Faceted crystal" },
  { path: "items/foundItems/low_gem_prison.svg", alt: "Gem prism" },
  { path: "items/foundItems/rought_cut_stone.svg", alt: "Rough cut stone" },
  { path: "items/foundItems/short_chunky_crystal.svg", alt: "Chunky crystal" },
  { path: "items/foundItems/split_crystal.svg", alt: "Split crystal" },
];

// Stable little hash so the same encounter name always maps to the same sprite
function pickSpriteForEncounter(name: string | null) {
  if (!name || FOUND_ITEM_SPRITES.length === 0) return null;

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) | 0;
  }

  const index = Math.abs(hash) % FOUND_ITEM_SPRITES.length;
  return FOUND_ITEM_SPRITES[index];
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
  isWalking = true,
}) => {
  // For GitHub Pages this will be "/dream/". Vite serves /public at the root:
  //   <baseUrl>assets/parallax/<environmentId>/layer_01.png
  //   <baseUrl>items/foundItems/your_sprite.svg
  const baseUrl = import.meta.env.BASE_URL || "/";

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    !isWalking ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const chosenSprite = pickSpriteForEncounter(encounterItemName);

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

      {/* Loot encounter: pulse + item sprite in front of the avatar */}
      {encounterItemName && (
        <>
          <div className="world-lane-encounter-pulse" aria-hidden="true" />
          <div className="world-lane-crystal" aria-hidden="true">
            {chosenSprite && (
              <img
                src={`${baseUrl}${chosenSprite.path}`}
                alt={chosenSprite.alt}
                className="world-lane-crystal-img"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WorldLane;
