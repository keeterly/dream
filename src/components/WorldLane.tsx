import React, { useEffect, useRef, useState } from "react";

interface WorldLaneProps {
  profile: unknown | null;
  phase: string;
  environmentId: string;
  encounterItemName: string | null;
  isEncounterActive?: boolean; // "Relic found" banner / encounter is live
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
 * Explicit filename overrides for items that don't slug nicely.
 */
const LOOT_FILE_OVERRIDES: Record<string, string> = {
  "Glass Relic": "glass_relic.svg",
};

function slugToFileName(label: string): string {
  const trimmed = label.trim();

  // Explicit override first.
  const override = LOOT_FILE_OVERRIDES[trimmed];
  if (override) return override;

  // Fallback: "Bloom Charm" -> "bloom_charm.svg"
  const slug = trimmed
    .toLowerCase()
    .replace(/['’]/g, "") // drop apostrophes
    .replace(/[^a-z0-9]+/g, "_") // spaces & punctuation -> underscores
    .replace(/^_+|_+$/g, ""); // trim leading/trailing "_"

  return `${slug}.svg`;
}

function resolveLootSprite(encounterItemName: string | null, baseUrl: string) {
  if (!encounterItemName) return null;
  const fileName = slugToFileName(encounterItemName);
  return `${baseUrl}items/foundItems/${fileName}`;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  phase,
  environmentId,
  encounterItemName,
  isEncounterActive = false,
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

  const lootSpriteSrc = resolveLootSprite(encounterItemName, baseUrl);

  /**
   * PICKUP ANIMATION STATE
   *
   * We want:
   *  - Item slides in along the ribbon while encounterItemName is set.
   *  - When isEncounterActive is true, the loot parks beside the avatar.
   *  - Only AFTER the player confirms (parent clears encounterItemName),
   *    we play a short "pickup" animation instead of the item vanishing.
   */

  type PickupSprite = { name: string; src: string } | null;
  const [pickupSprite, setPickupSprite] = useState<PickupSprite>(null);

  const prevNameRef = useRef<string | null>(null);
  const prevSrcRef = useRef<string | null>(null);
  const pickupTimeoutRef = useRef<number | null>(null);

  // Track transitions of the encounter item so we can detect when it is cleared.
  useEffect(() => {
    const prevName = prevNameRef.current;
    const prevSrc = prevSrcRef.current;

    // When the parent clears encounterItemName (after player confirms),
    // we still want to show a short pickup animation using the last sprite.
    if (!encounterItemName && prevName && prevSrc) {
      // Kill any in-progress pickup.
      if (pickupTimeoutRef.current !== null) {
        window.clearTimeout(pickupTimeoutRef.current);
        pickupTimeoutRef.current = null;
      }

      setPickupSprite({ name: prevName, src: prevSrc });

      // After the pickup animation duration, clear the local sprite.
      pickupTimeoutRef.current = window.setTimeout(() => {
        setPickupSprite(null);
        pickupTimeoutRef.current = null;
      }, 700); // keep slightly longer than the CSS 650ms
    }

    // Update previous values for next tick.
    prevNameRef.current = encounterItemName;
    prevSrcRef.current = lootSpriteSrc;

    return () => {
      if (pickupTimeoutRef.current !== null) {
        window.clearTimeout(pickupTimeoutRef.current);
        pickupTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterItemName, lootSpriteSrc]);

  /**
   * Decide what loot (if any) to render and which CSS class to apply:
   *
   * 1. New/ongoing encounter (encounterItemName present):
   *    - !isEncounterActive  -> slide-in along ribbon  ( --approach )
   *    - isEncounterActive   -> parked beside avatar  ( --idle )
   *
   * 2. Encounter just confirmed (encounterItemName cleared):
   *    - use pickupSprite    -> play pickup anim       ( --pickup )
   *
   * 3. Otherwise: no loot rendered.
   */

  let lootClassName: string | null = null;
  let lootName: string | null = null;
  let lootSrcToRender: string | null = null;

  if (encounterItemName && lootSpriteSrc) {
    lootName = encounterItemName;
    lootSrcToRender = lootSpriteSrc;
    lootClassName = [
      "world-lane-loot",
      isEncounterActive ? "world-lane-loot--idle" : "world-lane-loot--approach",
    ]
      .filter(Boolean)
      .join(" ");
  } else if (pickupSprite) {
    lootName = pickupSprite.name;
    lootSrcToRender = pickupSprite.src;
    lootClassName = "world-lane-loot world-lane-loot--pickup";
  }

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

      {/* Grounded loot on the ribbon */}
      {lootClassName && lootSrcToRender && (
        <div className={lootClassName}>
          <div className="world-lane-loot-shadow" aria-hidden="true" />
          <img
            className="world-lane-loot-image"
            src={lootSrcToRender}
            alt={lootName ?? "Found item"}
          />
        </div>
      )}
    </div>
  );
};

export default WorldLane;
