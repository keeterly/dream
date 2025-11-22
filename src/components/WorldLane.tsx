import React, { useEffect, useRef, useState } from "react";

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
 * Explicit overrides for items whose filenames don't match
 * the slug pattern. Keys are LOWER-CASED item names.
 */
const LOOT_FILE_OVERRIDES: Record<string, string> = {
  "glass relic": "glass_relic.svg",
};

function slugToFileName(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "") // drop apostrophes
    .replace(/[^a-z0-9]+/g, "_") // spaces & punctuation -> underscores
    .replace(/^_+|_+$/g, ""); // trim leading/trailing "_"

  return `${slug}.svg`;
}

function resolveLootSprite(itemName: string | null, baseUrl: string): string | null {
  if (!itemName) return null;

  const key = itemName.trim().toLowerCase();
  const fileName = LOOT_FILE_OVERRIDES[key] ?? slugToFileName(itemName);

  // This matches how your other assets are referenced and keeps GitHub Pages happy
  return `${baseUrl}items/foundItems/${fileName}`;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive,
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

  // --- APPROACH / IDLE LOOT (while encounterItemName is non-null) ---
  const lootSpriteSrc = resolveLootSprite(encounterItemName, baseUrl);

  const lootStateClass =
    lootSpriteSrc && encounterItemName
      ? isEncounterActive
        ? "world-lane-loot--idle" // character is next to it; stop moving
        : "world-lane-loot--approach" // sliding in from off-screen
      : "";

  // --- PICKUP ANIMATION (after confirm button pressed) ---
  // We detect the transition from "had an item" to "no item"
  // and play a short pickup animation using the previous item sprite.
  const prevEncounterRef = useRef<string | null>(null);
  const [pickupSprite, setPickupSprite] = useState<string | null>(null);
  const [pickupName, setPickupName] = useState<string | null>(null);
  const [isPickingUp, setIsPickingUp] = useState(false);

  useEffect(() => {
    const prevName = prevEncounterRef.current;

    // Parent cleared encounterItemName -> treat as "confirmed / picked up"
    if (prevName && !encounterItemName) {
      const sprite = resolveLootSprite(prevName, baseUrl);
      if (sprite) {
        setPickupSprite(sprite);
        setPickupName(prevName);
        setIsPickingUp(true);

        const timeout = window.setTimeout(() => {
          setIsPickingUp(false);
          setPickupSprite(null);
          setPickupName(null);
        }, 650); // match CSS pickup duration

        return () => window.clearTimeout(timeout);
      }
    }

    prevEncounterRef.current = encounterItemName;
  }, [encounterItemName, baseUrl]);

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

        {/* The actual ribbon strip the character walks on */}
        <div className="world-lane-ribbon" />
      </div>

      {/* Loot sliding in along the ribbon, then waiting beside the character */}
      {lootSpriteSrc && encounterItemName && (
        <div
          className={`world-lane-loot ${lootStateClass}`}
          aria-hidden="true"
        >
          <div className="world-lane-loot-shadow" />
          <img
            src={lootSpriteSrc}
            alt={encounterItemName}
            className="world-lane-loot-image"
          />
        </div>
      )}

      {/* Pickup animation AFTER the encounter is confirmed (item added to inventory) */}
      {isPickingUp && pickupSprite && (
        <div className="world-lane-loot world-lane-loot--pickup" aria-hidden="true">
          <div className="world-lane-loot-shadow" />
          <img
            src={pickupSprite}
            alt={pickupName ?? "Found item"}
            className="world-lane-loot-image"
          />
        </div>
      )}
    </div>
  );
};

export default WorldLane;
