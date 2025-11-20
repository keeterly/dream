import React from "react";
import "./AvatarView.css";

interface AvatarViewProps {
  avatar: any;
  traits?: any;
  dreamName?: string;
}

function normalizeKey(value: unknown): string {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
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

function getPalette(elementKey: string) {
  const palettes: Record<
    string,
    { robe: string; trim: string; glow: string; accent: string }
  > = {
    ember: {
      robe: "#2B1812",
      trim: "#F6A45C",
      glow: "#FFB077",
      accent: "#FF7A3C",
    },
    glass: {
      robe: "#101623",
      trim: "#C4D9FF",
      glow: "#9FD3FF",
      accent: "#7BB3FF",
    },
    tide: {
      robe: "#0E1920",
      trim: "#8FD7D9",
      glow: "#7BE6FF",
      accent: "#47C2E8",
    },
    shadow: {
      robe: "#151221",
      trim: "#C7B6FF",
      glow: "#A493FF",
      accent: "#7B5BFF",
    },
    stone: {
      robe: "#1C2024",
      trim: "#E4DFCF",
      glow: "#F2E8D4",
      accent: "#C6B593",
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

function getBodyShape(archetypeKey: string, avatar: any) {
  const bodyType = normalizeKey(avatar?.bodyType);
  const posture = normalizeKey(avatar?.posture);

  // base cloak for archetypes
  let width = 56;
  let height = 72;
  let offsetX = 50;
  let offsetY = 74;
  let lean = 0;

  if (archetypeKey === "architect") {
    width = 60;
    height = 70;
  } else if (archetypeKey === "seer") {
    width = 52;
    height = 76;
  } else if (archetypeKey === "wanderer") {
    width = 58;
    height = 80;
    lean = 2;
  }

  if (bodyType === "narrow") {
    width -= 6;
  } else if (bodyType === "broad") {
    width += 6;
  }

  if (posture === "bowed") {
    height += 6;
    lean -= 3;
  } else if (posture === "forward") {
    lean += 3;
  } else if (posture === "stoic") {
    height -= 4;
  }

  return { width, height, offsetX, offsetY, lean };
}

function getCloakStyle(avatar: any, archetypeKey: string): "classic" | "glyph" | "trail" {
  const style = normalizeKey(avatar?.cloakStyle);
  if (style === "glyph" || style === "trail") return style;

  // archetype defaults
  if (archetypeKey === "architect") return "glyph";
  if (archetypeKey === "wanderer") return "trail";
  return "classic";
}

function hasCompanion(avatar: any): boolean {
  const t = normalizeKey(avatar?.companionType);
  return !!t && t !== "none";
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  avatar,
  traits,
  dreamName,
}) => {
  const elementKey = getElementKey(avatar, traits, dreamName);
  const archetypeKey = getArchetypeKey(avatar, traits, dreamName);

  const palette = getPalette(elementKey);
  const { width, height, offsetX, offsetY, lean } = getBodyShape(
    archetypeKey,
    avatar
  );
  const cloakStyle = getCloakStyle(avatar, archetypeKey);
  const companion = hasCompanion(avatar);

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
          <radialGradient id="avatarGlow" cx="50%" cy="25%" r="60%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.8" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={120}
          height={160}
          fill="url(#avatarGlow)"
          opacity={0.4}
        />

        {/* ground shadow */}
        <ellipse
          cx={offsetX + lean * 0.8}
          cy={offsetY + 8}
          rx={halfW * 0.95}
          ry={10}
          fill="rgba(0,0,0,0.7)"
          style={{ filter: "blur(3px)" }}
        />

        {/* cloak body */}
        <path
          d={`
          M ${offsetX - halfW + lean}, ${offsetY}
          Q ${offsetX + lean}, ${topY + 6} ${offsetX + halfW + lean}, ${offsetY}
          L ${offsetX + halfW * 0.9 + lean}, ${offsetY + height * 0.55}
          Q ${offsetX + lean}, ${offsetY + height} ${
            offsetX - halfW * 0.9 + lean
          }, ${offsetY + height * 0.55}
          Z
        `}
          fill={palette.robe}
          stroke={palette.trim}
          strokeWidth={1.4}
        />

        {/* hood */}
        <circle
          cx={offsetX + lean}
          cy={topY + 10}
          r={11}
          fill={palette.robe}
          stroke={palette.trim}
          strokeWidth={1.4}
        />

        {/* mask / face variants */}
        {archetypeKey === "architect" && (
          <>
            {/* round mask, twin eyes */}
            <circle
              cx={offsetX + lean}
              cy={topY + 10}
              r={6.4}
              fill="#05060A"
              stroke={palette.glow}
              strokeWidth={0.8}
            />
            <circle
              cx={offsetX + lean - 2.2}
              cy={topY + 9.5}
              r={0.9}
              fill={palette.glow}
            />
            <circle
              cx={offsetX + lean + 2.2}
              cy={topY + 9.5}
              r={0.9}
              fill={palette.glow}
            />
          </>
        )}

        {archetypeKey === "seer" && (
          <>
            {/* almond mask with glowing pupil */}
            <path
              d={`
                M ${offsetX + lean - 6}, ${topY + 10}
                Q ${offsetX + lean}, ${topY + 5} ${offsetX + lean + 6}, ${
                topY + 10
              }
                Q ${offsetX + lean}, ${topY + 15} ${offsetX + lean - 6}, ${
                topY + 10
              }
              `}
              fill="#05060A"
              stroke={palette.glow}
              strokeWidth={0.9}
            />
            <circle
              cx={offsetX + lean}
              cy={topY + 10}
              r={2.1}
              fill={palette.glow}
            />
          </>
        )}

        {archetypeKey === "wanderer" && (
          <>
            {/* tall oval with vertical slit */}
            <ellipse
              cx={offsetX + lean}
              cy={topY + 10}
              rx={4.2}
              ry={6.6}
              fill="#05060A"
              stroke={palette.glow}
              strokeWidth={0.9}
            />
            <rect
              x={offsetX + lean - 0.7}
              y={topY + 5}
              width={1.4}
              height={10}
              rx={0.7}
              fill={palette.glow}
            />
          </>
        )}

        {/* fallback if archetype somehow unknown */}
        {archetypeKey !== "architect" &&
          archetypeKey !== "seer" &&
          archetypeKey !== "wanderer" && (
            <circle
              cx={offsetX + lean}
              cy={topY + 10}
              r={6.4}
              fill="#05060A"
              stroke={palette.glow}
              strokeWidth={0.8}
            />
          )}

        {/* chest glyphs */}
        {cloakStyle !== "trail" && (
          <>
            {/* base triangle mark */}
            <path
              d={`
              M ${offsetX + lean}, ${offsetY - height * 0.35}
              L ${offsetX + lean - 3.5}, ${offsetY - height * 0.15}
              L ${offsetX + lean + 3.5}, ${offsetY - height * 0.15}
              Z
            `}
              fill="none"
              stroke={palette.accent}
              strokeWidth={1}
              strokeLinejoin="round"
              opacity={0.85}
            />
            {/* archetype-specific below the triangle */}
            {archetypeKey === "architect" && (
              <rect
                x={offsetX + lean - 2.5}
                y={offsetY - height * 0.1}
                width={5}
                height={7}
                fill="none"
                stroke={palette.accent}
                strokeWidth={0.8}
              />
            )}
            {archetypeKey === "seer" && (
              <circle
                cx={offsetX + lean}
                cy={offsetY - height * 0.07}
                r={3.2}
                fill="none"
                stroke={palette.accent}
                strokeWidth={0.9}
              />
            )}
            {archetypeKey === "wanderer" && (
              <path
                d={`
                M ${offsetX + lean}, ${offsetY - height * 0.08}
                Q ${offsetX + lean + 6}, ${offsetY} ${
                  offsetX + lean
                }, ${offsetY + 6}
                Q ${offsetX + lean - 6}, ${offsetY} ${
                  offsetX + lean
                }, ${offsetY - 8}
              `}
                fill="none"
                stroke={palette.accent}
                strokeWidth={0.9}
              />
            )}
          </>
        )}

        {/* trailing cloak edge for 'trail' style */}
        {cloakStyle === "trail" && (
          <path
            d={`
            M ${offsetX + halfW * 0.9 + lean}, ${offsetY + height * 0.55}
            Q ${offsetX + halfW * 1.3 + lean}, ${offsetY + height * 0.8}
              ${offsetX + halfW * 1.6 + lean}, ${offsetY + height * 0.95}
          `}
            fill="none"
            stroke={palette.accent}
            strokeWidth={1.2}
            opacity={0.8}
          />
        )}

        {/* small companion sprite if present */}
        {companion && (
          <>
            <ellipse
              cx={offsetX + halfW + 10 + lean}
              cy={offsetY + 5}
              rx={8}
              ry={3}
              fill="rgba(0,0,0,0.7)"
              style={{ filter: "blur(2px)" }}
            />
            <rect
              x={offsetX + halfW + 5 + lean}
              y={offsetY - 14}
              width={10}
              height={18}
              rx={3}
              fill="#050810"
              stroke={palette.glow}
              strokeWidth={0.8}
            />
            <circle
              cx={offsetX + halfW + 10 + lean}
              cy={offsetY - 10}
              r={3.3}
              fill={palette.glow}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default AvatarView;
