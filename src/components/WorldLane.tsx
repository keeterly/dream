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

// Parallax PNGs
const PARALLAX_LAYERS = [
  { file: "layer_01.png", depth: 0, duration: 70, opacity: 0.4, blur: 1.6 },
  { file: "layer_02.png", depth: 1, duration: 50, opacity: 0.7, blur: 1.0 },
  { file: "layer_03.png", depth: 2, duration: 32, opacity: 0.9, blur: 0.6 },
  { file: "layer_04.png", depth: 3, duration: 22, opacity: 0.95, blur: 0.3 },
  { file: "layer_05.png", depth: 4, duration: 14, opacity: 1.0, blur: 0 },
];

// Your new “found item” SVGs that live in /public/items/foundItems
const FOUND_ITEM_SPRITES = [
  "faceted_diamond.svg",
  "low_gem_prison.svg",
  "rought_cut_stone.svg",
  "short_chunky_crystal.svg",
  "split_crystal.svg",
] as const;

type FoundSprite = (typeof FOUND_ITEM_SPRITES)[number];

function pickSpriteForName(name: string | null): FoundSprite {
  if (!name) return FOUND_ITEM_SPRITES[0];

  // Tiny deterministic hash so the same relic name always maps
  // to the same SVG, but spreads names across the set.
  const hash = Array.from(name).reduce(
    (acc, ch) => acc + ch.charCodeAt(0),
    0
  );
  const index = hash % FOUND_ITEM_SPRITES.length;
  return FOUND_ITEM_SPRITES[index];
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive = false,
  isWalking = true,
}) => {
  const baseUrl = import.meta.env.BASE_URL || "/";

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    !isWalking ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const spritePath = useMemo(() => {
    if (!encounterItemName) return null;
    const fileName = pickSpriteForName(encounterItemName);
    return `${baseUrl}items/foundItems/${fileName}`;
  }, [baseUrl, encounterItemName]);

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

        {/* Ground strip the character walks on */}
        <div className="world-lane-ribbon" />
      </div>

      {/* Loot sitting on the ribbon, in front of the avatar */}
      {spritePath && isEncounterActive && (
        <>
          {/* ground glow */}
          <div className="world-lane-encounter-pulse" aria-hidden="true" />

          {/* the actual found item sprite */}
          <div className="world-lane-encounter-item" aria-hidden="true">
            <img src={spritePath} alt={encounterItemName ?? "Found item"} />
          </div>
        </>
      )}
    </div>
  );
};

export default WorldLane;
