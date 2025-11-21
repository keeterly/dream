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
 * Nier-style found-item sprites that live in:
 *   public/items/foundItems/<name>.svg
 */
const FOUND_ITEM_SVGS = [
  "faceted_diamond.svg",
  "low_gem_prison.svg",
  "rought_cut_stone.svg",      // note: matches your actual filename
  "short_chunky_crystal.svg",
  "split_crystal.svg",
] as const;

function pickSpriteIndexFromName(name: string | null): number {
  if (!name) return 0;
  // simple deterministic hash so the same relic name always maps
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  if (hash < 0) hash = -hash;
  return hash % FOUND_ITEM_SVGS.length;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
  isWalking = true,
}) => {
  // For GitHub Pages this will be "/dream/".
  const baseUrl = import.meta.env.BASE_URL || "/";
  const assetRoot = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const rootClassName = [
    "world-lane",
    `world-lane--${environmentId}`,
    `world-lane--phase-${phase.toLowerCase()}`,
    !isWalking ? "world-lane--paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Decide which SVG to show for this encounter (if any)
  let foundItemSrc: string | null = null;
  if (isEncounterActive && encounterItemName) {
    const spriteIndex = pickSpriteIndexFromName(encounterItemName);
    const fileName = FOUND_ITEM_SVGS[spriteIndex];
    foundItemSrc = `${assetRoot}items/foundItems/${fileName}`;
  }

  return (
    <div className={rootClassName}>
      <div className="world-lane-inner">
        {/* Parallax art layers */}
        {PARALLAX_LAYERS.map((layer) => {
          const imgPath = `${assetRoot}assets/parallax/${environmentId}/${layer.file}`;
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

      {/* Loot encounter: glowing sprite + ground pulse in front of the avatar */}
      {isEncounterActive && (
        <>
          <div className="world-lane-encounter-pulse" aria-hidden="true" />

          <div className="world-lane-found-item-shell" aria-hidden="true">
            <div className="world-lane-found-item-glow" />
            {foundItemSrc && (
              <img
                className="world-lane-found-item"
                src={foundItemSrc}
                alt={encounterItemName ?? "Found relic"}
                onError={(e) => {
                  // If an SVG path is wrong, just hide the image and keep the glow.
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WorldLane;
