import React from "react";
import "./AvatarView.css";

interface AvatarViewProps {
  avatar: any;
  traits?: any;
  dreamName?: string;
}

/** ----------- tiny deterministic "rng" helpers ----------- **/

function normalizeKey(value: unknown): string {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
}

// simple deterministic hash → [0, 1)
function hashToUnit(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

// hash → integer [0, max)
function hashToInt(str: string, max: number): number {
  return Math.floor(hashToUnit(str) * max);
}

function splitDreamName(dreamName?: string) {
  if (!dreamName) return { archetype: "", element: "" };
  const parts = dreamName.split(" of ");
  if (parts.length === 2) {
    return {
      archetype: normalizeKey(parts[0]),
      element: normalizeKey(parts[1]),
    };
  }
  return { archetype: "", element: "" };
}

function getElementKey(avatar: any, traits?: any, dreamName?: string): string {
  const fromName = splitDreamName(dreamName).element;

  const candidates = [
    avatar?.elementKey,
    avatar?.primaryElement,
    avatar?.element,
    traits?.primaryElement,
    traits?.elementKey,
    traits?.element,
    fromName,
  ];

  for (const val of candidates) {
    const key = normalizeKey(val);
    if (key) return key;
  }

  return "glass";
}

function getArchetypeKey(
  avatar: any,
  traits?: any,
  dreamName?: string
): string {
  const fromName = splitDreamName(dreamName).archetype;

  const candidates = [
    avatar?.archetypeKey,
    avatar?.primaryArchetype,
    avatar?.archetype,
    traits?.primaryArchetype,
    traits?.archetypeKey,
    traits?.archetype,
    fromName,
  ];

  for (const val of candidates) {
    const key = normalizeKey(val);
    if (key) return key;
  }

  return "seer";
}

/** ----------- palette per element ----------- **/

function getPalette(elementKey: string) {
  const palettes: Record<
    string,
    { robe: string; trim: string; glow: string; accent: string; inner: string }
  > = {
    ember: {
      robe: "#301617",
      trim: "#FBB076",
      glow: "#FFB977",
      accent: "#FF7A3C",
      inner: "#201012",
    },
    glass: {
      robe: "#111827",
      trim: "#C4D9FF",
      glow: "#A4DAFF",
      accent: "#7BB3FF",
      inner: "#070913",
    },
    tide: {
      robe: "#0E1C22",
      trim: "#8FD7D9",
      glow: "#7BE6FF",
      accent: "#47C2E8",
      inner: "#061016",
    },
    shadow: {
      robe: "#151322",
      trim: "#C7B6FF",
      glow: "#B6A0FF",
      accent: "#7B5BFF",
      inner: "#05040B",
    },
    stone: {
      robe: "#2B2A29",
      trim: "#E4DFCF",
      glow: "#F2E8D4",
      accent: "#C6B593",
      inner: "#151412",
    },
  };

  if (elementKey.startsWith("fire") || elementKey === "ember")
    return palettes.ember;
  if (elementKey.startsWith("glass")) return palettes.glass;
  if (elementKey.startsWith("water") || elementKey.startsWith("tide"))
    return palettes.tide;
  if (elementKey.startsWith("shadow") || elementKey.startsWith("night"))
    return palettes.shadow;
  if (elementKey.startsWith("stone") || elementKey.startsWith("earth"))
    return palettes.stone;

  return palettes[elementKey] || palettes.glass;
}

/** ----------- body / cloak geometry ----------- **/

function getBodyShape(archetypeKey: string, variantIndex: number) {
  // base cloak: 120x160 canvas
  let width = 54;
  let height = 78;
  let offsetX = 60;
  let offsetY = 96;
  let lean = 0;

  // archetype silhouette
  if (archetypeKey === "architect") {
    width = 60;
    height = 76;
  } else if (archetypeKey === "seer") {
    width = 52;
    height = 80;
  } else if (archetypeKey === "wanderer") {
    width = 58;
    height = 84;
    lean = 2;
  }

  // variant tweaks: hem length + lean
  if (variantIndex === 1) {
    height += 4;
  } else if (variantIndex === 2) {
    height -= 3;
    lean -= 1;
  } else if (variantIndex === 3) {
    lean += 2;
  }

  return { width, height, offsetX, offsetY, lean };
}

function getCloakStyle(
  archetypeKey: string,
  variantIndex: number
): "classic" | "glyph" | "trail" {
  if (archetypeKey === "architect") {
    return variantIndex % 2 === 0 ? "glyph" : "classic";
  }
  if (archetypeKey === "wanderer") {
    return "trail";
  }
  // seer
  return variantIndex % 3 === 0 ? "glyph" : "classic";
}

function hasCompanion(avatar: any, variantIndex: number): boolean {
  const explicit = normalizeKey(avatar?.companionType);
  if (explicit && explicit !== "none") return true;
  // 50% chance per seed for some variation
  return variantIndex % 2 === 0;
}

/** ----------- mask variants ----------- **/

function renderMask(
  archetypeKey: string,
  palette: ReturnType<typeof getPalette>,
  offsetX: number,
  topY: number,
  lean: number,
  variantIndex: number
) {
  const baseY = topY + 10;

  if (archetypeKey === "architect") {
    // round mask, twin or triple eyes
    const eyeCount = variantIndex % 3 === 0 ? 3 : 2;
    const spacing = eyeCount === 3 ? 2.1 : 2.6;

    const eyes = [];
    const start = -spacing * (eyeCount - 1) * 0.5;
    for (let i = 0; i < eyeCount; i++) {
      eyes.push(
        <circle
          key={i}
          cx={offsetX + lean + start + spacing * i}
          cy={baseY - 0.4}
          r={0.9}
          fill={palette.glow}
        />
      );
    }

    return (
      <>
        <circle
          cx={offsetX + lean}
          cy={baseY}
          r={6.6}
          fill={palette.inner}
          stroke={palette.glow}
          strokeWidth={0.9}
        />
        {eyes}
      </>
    );
  }

  if (archetypeKey === "seer") {
    // almond eye; variant chooses pupil vs slit vs crescent
    const style = variantIndex % 3;

    const almond = (
      <path
        d={`
          M ${offsetX + lean - 6}, ${baseY}
          Q ${offsetX + lean}, ${baseY - 5} ${offsetX + lean + 6}, ${baseY}
          Q ${offsetX + lean}, ${baseY + 5} ${offsetX + lean - 6}, ${baseY}
        `}
        fill={palette.inner}
        stroke={palette.glow}
        strokeWidth={0.9}
      />
    );

    if (style === 0) {
      return (
        <>
          {almond}
          <circle cx={offsetX + lean} cy={baseY} r={2.2} fill={palette.glow} />
        </>
      );
    }
    if (style === 1) {
      return (
        <>
          {almond}
          <rect
            x={offsetX + lean - 0.8}
            y={baseY - 3.3}
            width={1.6}
            height={6.6}
            rx={0.8}
            fill={palette.glow}
          />
        </>
      );
    }
    // crescent
    return (
      <>
        {almond}
        <path
          d={`
            M ${offsetX + lean - 3}, ${baseY - 1.5}
            Q ${offsetX + lean}, ${baseY + 1.5} ${
            offsetX + lean + 3
          }, ${baseY - 1.5}
          `}
          fill="none"
          stroke={palette.glow}
          strokeWidth={1.3}
          strokeLinecap="round"
        />
      </>
    );
  }

  if (archetypeKey === "wanderer") {
    // tall hood with slit or double-slit
    const double = variantIndex % 3 === 0;

    return (
      <>
        <ellipse
          cx={offsetX + lean}
          cy={baseY}
          rx={4.4}
          ry={6.8}
          fill={palette.inner}
          stroke={palette.glow}
          strokeWidth={1}
        />
        <rect
          x={offsetX + lean - 0.7}
          y={baseY - 4.2}
          width={1.4}
          height={8.4}
          rx={0.7}
          fill={palette.glow}
        />
        {double && (
          <rect
            x={offsetX + lean + 2.3}
            y={baseY - 2}
            width={1}
            height={4}
            rx={0.5}
            fill={palette.glow}
            opacity={0.8}
          />
        )}
      </>
    );
  }

  // fallback: simple round mask
  return (
    <circle
      cx={offsetX + lean}
      cy={baseY}
      r={6.2}
      fill={palette.inner}
      stroke={palette.glow}
      strokeWidth={0.9}
    />
  );
}

/** ----------- main component ----------- **/

export const AvatarView: React.FC<AvatarViewProps> = ({
  avatar,
  traits,
  dreamName,
}) => {
  const elementKey = getElementKey(avatar, traits, dreamName);
  const archetypeKey = getArchetypeKey(avatar, traits, dreamName);
  const palette = getPalette(elementKey);

  // seed string for deterministic variation; if you later add avatar.randomSeed
  // each profile can get a unique look even with identical answers.
  const seedString =
    (dreamName || "") +
    "|" +
    (traits?.primaryArchetype || "") +
    "|" +
    (traits?.primaryElement || "") +
    "|" +
    (avatar?.randomSeed || "");

  const variantIndex = hashToInt(seedString, 4); // 0..3

  const { width, height, offsetX, offsetY, lean } = getBodyShape(
    archetypeKey,
    variantIndex
  );
  const cloakStyle = getCloakStyle(archetypeKey, variantIndex);
  const companion = hasCompanion(avatar, variantIndex);

  const halfW = width / 2;
  const topY = offsetY - height;

  return (
    <div className="avatar-view-root">
      <svg
        className="avatar-view-svg"
        viewBox="0 0 120 160"
        role="img"
        aria-label="Dreamself avatar"
      >
        {/* soft background halo */}
        <defs>
          <radialGradient id="avatarGlow" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.85" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={120}
          height={160}
          fill="url(#avatarGlow)"
          opacity={0.5}
        />

        {/* ground shadow */}
        <ellipse
          cx={offsetX + lean * 0.8}
          cy={offsetY + 10}
          rx={halfW * 1.05}
          ry={11}
          fill="rgba(0,0,0,0.75)"
          style={{ filter: "blur(3px)" }}
        />

        {/* cloak body (upper torso + hem) */}
        <path
          d={`
          M ${offsetX - halfW + lean}, ${offsetY}
          Q ${offsetX + lean}, ${topY + 12} ${offsetX + halfW + lean}, ${offsetY}
          L ${offsetX + halfW * 0.85 + lean}, ${offsetY + height * 0.52}
          Q ${offsetX + lean}, ${offsetY + height} ${
            offsetX - halfW * 0.85 + lean
          }, ${offsetY + height * 0.52}
          Z
        `}
          fill={palette.robe}
          stroke={palette.trim}
          strokeWidth={1.4}
        />

        {/* shoulder cape hint */}
        <path
          d={`
          M ${offsetX - halfW * 0.9 + lean}, ${offsetY - height * 0.18}
          Q ${offsetX + lean}, ${topY + 8} ${
          offsetX + halfW * 0.9 + lean
        }, ${offsetY - height * 0.18}
        `}
          fill="none"
          stroke={palette.trim}
          strokeWidth={1}
          opacity={0.75}
        />

        {/* hood outline */}
        <path
          d={`
          M ${offsetX - 11 + lean}, ${topY + 14}
          Q ${offsetX + lean}, ${topY} ${offsetX + 11 + lean}, ${topY + 14}
        `}
          fill="none"
          stroke={palette.trim}
          strokeWidth={1.1}
        />

        {/* MASK / FACE */}
        {renderMask(
          archetypeKey,
          palette,
          offsetX,
          topY,
          lean,
          variantIndex
        )}

        {/* BELT / WAIST GLYPHS */}
        <g opacity={0.9}>
          {/* base belt line */}
          <path
            d={`
            M ${offsetX - halfW * 0.7 + lean}, ${offsetY + height * 0.15}
            L ${offsetX + halfW * 0.7 + lean}, ${offsetY + height * 0.15}
          `}
            fill="none"
            stroke={palette.trim}
            strokeWidth={0.9}
          />

          {/* archetype / variant details */}
          {archetypeKey === "architect" && (
            <>
              <rect
                x={offsetX - 6 + lean}
                y={offsetY + height * 0.11}
                width={12}
                height={6}
                rx={3}
                fill="none"
                stroke={palette.accent}
                strokeWidth={0.9}
              />
              <circle
                cx={offsetX + lean}
                cy={offsetY + height * 0.28}
                r={4}
                fill="none"
                stroke={palette.accent}
                strokeWidth={0.9}
              />
              <line
                x1={offsetX + lean}
                y1={offsetY + height * 0.17}
                x2={offsetX + lean}
                y2={offsetY + height * 0.24}
                stroke={palette.accent}
                strokeWidth={0.8}
              />
            </>
          )}

          {archetypeKey === "seer" && (
            <>
              <circle
                cx={offsetX + lean}
                cy={offsetY + height * 0.18}
                r={3}
                fill="none"
                stroke={palette.accent}
                strokeWidth={0.9}
              />
              {variantIndex % 2 === 0 && (
                <circle
                  cx={offsetX + lean}
                  cy={offsetY + height * 0.18}
                  r={1.4}
                  fill={palette.accent}
                />
              )}
            </>
          )}

          {archetypeKey === "wanderer" && (
            <>
              <path
                d={`
                M ${offsetX - 8 + lean}, ${offsetY + height * 0.16}
                Q ${offsetX + lean}, ${offsetY + height * 0.22} ${
                  offsetX + 8 + lean
                }, ${offsetY + height * 0.16}
              `}
                fill="none"
                stroke={palette.accent}
                strokeWidth={0.9}
              />
              {variantIndex % 2 === 1 && (
                <path
                  d={`
                  M ${offsetX + lean}, ${offsetY + height * 0.16}
                  L ${offsetX + lean}, ${offsetY + height * 0.28}
                `}
                  stroke={palette.accent}
                  strokeWidth={0.9}
                />
              )}
            </>
          )}
        </g>

        {/* hem glyphs for glyph / trail styles */}
        {cloakStyle !== "classic" && (
          <g opacity={0.85}>
            {cloakStyle === "glyph" && (
              <>
                <path
                  d={`
                  M ${offsetX + lean}, ${offsetY + height * 0.46}
                  L ${offsetX + lean}, ${offsetY + height * 0.68}
                `}
                  stroke={palette.accent}
                  strokeWidth={1}
                />
                <path
                  d={`
                  M ${offsetX - 7 + lean}, ${offsetY + height * 0.5}
                  L ${offsetX - 7 + lean}, ${offsetY + height * 0.7}
                `}
                  stroke={palette.accent}
                  strokeWidth={0.8}
                />
                <path
                  d={`
                  M ${offsetX + 7 + lean}, ${offsetY + height * 0.5}
                  L ${offsetX + 7 + lean}, ${offsetY + height * 0.7}
                `}
                  stroke={palette.accent}
                  strokeWidth={0.8}
                />
              </>
            )}

            {cloakStyle === "trail" && (
              <path
                d={`
                M ${offsetX + halfW * 0.9 + lean}, ${offsetY + height * 0.55}
                Q ${offsetX + halfW * 1.3 + lean}, ${offsetY + height * 0.78}
                  ${offsetX + halfW * 1.55 + lean}, ${offsetY + height * 0.96}
              `}
                fill="none"
                stroke={palette.accent}
                strokeWidth={1.2}
              />
            )}
          </g>
        )}

        {/* small companion sprite if present */}
        {companion && (
          <>
            <ellipse
              cx={offsetX + halfW + 10 + lean}
              cy={offsetY + 6}
              rx={7}
              ry={3}
              fill="rgba(0,0,0,0.7)"
              style={{ filter: "blur(2px)" }}
            />
            <rect
              x={offsetX + halfW + 4 + lean}
              y={offsetY - 14}
              width={10}
              height={18}
              rx={3}
              fill={palette.inner}
              stroke={palette.glow}
              strokeWidth={0.9}
            />
            <circle
              cx={offsetX + halfW + 9 + lean}
              cy={offsetY - 9}
              r={3.4}
              fill={palette.glow}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default AvatarView;
