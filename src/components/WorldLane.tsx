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

// Map encounter names -> SVG filenames in /public/items/foundItems
const LOOT_SPRITES: Record<string, string> = {
  // new dedicated asset
  glass_relic: "glass_relic.svg",

  // reuse the crystal set
  ember_token: "short_chunky_crystal.svg",
  bloom_charm: "faceted_diamond.svg",
  shadow_thread: "low_gem_prison.svg",
  aether_sigil: "rough_cut_stone.svg",

  // fallback if we ever get an unknown name
  default: "split_crystal.svg",
};

function slugifyItemName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getLootSpriteForName(itemName: string, baseUrl: string): string {
  const slug = slugifyItemName(itemName);
  const fileName = LOOT_SPRITES[slug] ?? LOOT_SPRITES.default;
  return `${baseUrl}items/foundItems/${fileName}`;
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

  // We only want to see the object on the ribbon while we’re walking up to it,
  // not during the “encounter” overlay itself.
  const shouldShowLoot = Boolean(encounterItemName && !isEncounterActive);

  const lootSpriteUrl =
    shouldShowLoot && encounterItemName
      ? getLootSpriteForName(encounterItemName, baseUrl)
      : null;

  // Changing this key restarts the CSS travel animation whenever a new
  // encounter item appears.
  const [lootSpawnKey, setLootSpawnKey] = React.useState(0);
  const lastEncounterName = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (
      encounterItemName &&
      encounterItemName !== lastEncounterName.current &&
      !isEncounterActive
    ) {
      setLootSpawnKey((k) => k + 1);
    }
    lastEncounterName.current = encounterItemName;
  }, [encounterItemName, isEncounterActive]);

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

        {/* The ground ribbon the character walks on */}
        <div className="world-lane-ribbon" />

        {/* Loot object on the ribbon, walking in from the right */}
        {shouldShowLoot && lootSpriteUrl && (
          <div
            key={lootSpawnKey}
            className="world-lane-loot-travel"
            style={{
              // Sync travel with walking; if auto-walk is off, the object “waits”
              animationPlayState: isWalking ? "running" : "paused",
            }}
          >
            <div className="world-lane-loot" aria-hidden="true">
              <img
                src={lootSpriteUrl}
                alt={encounterItemName ?? "Found item"}
                className="world-lane-loot-img"
                draggable={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldLane;
