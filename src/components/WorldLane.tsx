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
   * We animate the loot by changing its `left` percentage.
   * Avatar is at ~50%; we want the item to end slightly in front of them.
   */
  const [lootLeftPercent, setLootLeftPercent] = useState<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastItemNameRef = useRef<string | null>(null);

  useEffect(() => {
    // If there is no active loot item, reset everything and hide it.
    if (!encounterItemName || !lootSpriteSrc) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setLootLeftPercent(null);
      lastItemNameRef.current = null;
      return;
    }

    // If this is the same item as before and we already have a position,
    // don't restart the animation.
    if (
      encounterItemName === lastItemNameRef.current &&
      lootLeftPercent !== null
    ) {
      return;
    }

    lastItemNameRef.current = encounterItemName;

    // Spawn well off-screen to the right.
    const SPAWN_LEFT = 130; // %
    const TARGET_LEFT = 52; // % – just a couple steps in front of avatar at 50%

    // ↓↓↓ SLOWER so it feels like you're walking toward a grounded item ↓↓↓
    const SPEED_PERCENT_PER_SECOND = 6; // was 25 – much gentler “approach”
    // ↑↑↑ tweak this value if you want it even slower / faster ↑↑↑

    let currentLeft = SPAWN_LEFT;
    let lastTimestamp: number | null = null;

    setLootLeftPercent(currentLeft);

    const step = (timestamp: number) => {
      // If walking is paused, freeze the loot in place but keep RAF going
      // so it resumes smoothly when walking resumes.
      if (!isWalking) {
        animFrameRef.current = requestAnimationFrame(step);
        return;
      }

      if (lastTimestamp == null) {
        lastTimestamp = timestamp;
        animFrameRef.current = requestAnimationFrame(step);
        return;
      }

      const dtSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      currentLeft = Math.max(
        TARGET_LEFT,
        currentLeft - SPEED_PERCENT_PER_SECOND * dtSeconds
      );

      setLootLeftPercent(currentLeft);

      // Keep animating until we reach the target.
      if (currentLeft > TARGET_LEFT) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };

    // Start / restart the animation for this new item.
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounterItemName, lootSpriteSrc, isWalking]);

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

      {/* Loot icon on the ribbon: slides in from off-screen and parks near the avatar */}
      {lootSpriteSrc && lootLeftPercent !== null && (
        <div
          className="world-lane-loot"
          style={{
            left: `${lootLeftPercent}%`,
            opacity: 1,        // override any CSS opacity: 0
            animation: "none", // disable CSS keyframes on this node
          }}
        >
          <div className="world-lane-loot-shadow" aria-hidden="true" />
          <img
            className="world-lane-loot-image"
            src={lootSpriteSrc}
            alt={encounterItemName ?? "Found item"}
          />
          <div className="world-lane-loot-label">
            {encounterItemName ?? ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldLane;
