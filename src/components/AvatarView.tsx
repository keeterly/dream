import React from "react";

interface AvatarViewProps {
  // We keep this loose on purpose so we don't fight your existing types.ts.
  // Everything is accessed with optional chaining + fallbacks.
  avatar: any;
}

function getElementKey(avatar: any): string {
  return (
    avatar?.primaryElement ||
    avatar?.element ||
    avatar?.elementKey ||
    "glass"
  )
    .toString()
    .toLowerCase();
}

function getArchetypeKey(avatar: any): string {
  return (
    avatar?.primaryArchetype ||
    avatar?.archetype ||
    avatar?.archetypeKey ||
    "seer"
  )
    .toString()
    .toLowerCase();
}

function getPalette(avatar: any) {
  const element = getElementKey(avatar);

  // You can tweak these hex codes to better match VENIA’s palette.
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

  return palettes[element] || palettes.glass;
}

function getBodyShape(avatar: any) {
  const bodyType = (avatar?.bodyType || "tall").toString().toLowerCase();
  const posture = (avatar?.posture || "neutral").toString().toLowerCase();

  // width & height of cloak blob relative to 100x140 canvas
  let width = 56;
  let height = 72;
  let offsetX = 50;
  let offsetY = 74;
  let lean = 0;

  if (bodyType === "narrow") {
    width = 48;
  } else if (bodyType === "broad") {
    width = 64;
  }

  if (posture === "stoic") {
    height = 70;
  } else if (posture === "bowed") {
    height = 80;
    lean = -4;
  } else if (posture === "forward") {
    lean = 3;
  }

  return { width, height, offsetX, offsetY, lean };
}

function getCloakStyle(avatar: any): "classic" | "glyph" | "trail" {
  const style = (avatar?.cloakStyle || "classic").toString().toLowerCase();
  if (style === "glyph" || style === "trail") return style;
  return "classic";
}

function hasCompanion(avatar: any): boolean {
  return !!(avatar?.companionType && avatar.companionType !== "none");
}

export const AvatarView: React.FC<AvatarViewProps> = ({ avatar }) => {
  const palette = getPalette(avatar);
  const archetypeKey = getArchetypeKey(avatar);
  const { width, height, offsetX, offsetY, lean } = getBodyShape(avatar);
  const cloakStyle = getCloakStyle(avatar);
  const companion = hasCompanion(avatar);

  // cloak radius approximated from width/height
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

        {/* hood circle */}
        <circle
          cx={offsetX + lean}
          cy={topY + 10}
          r={11}
          fill={palette.robe}
          stroke={palette.trim}
          strokeWidth={1.4}
        />

        {/* mask face */}
        <circle
          cx={offsetX + lean}
          cy={topY + 10}
          r={6.4}
          fill="#05060A"
          stroke={palette.glow}
          strokeWidth={0.8}
        />
        <circle
          cx={offsetX + lean - 2.3}
          cy={topY + 9.6}
          r={0.9}
          fill={palette.glow}
        />
        <circle
          cx={offsetX + lean + 2.3}
          cy={topY + 9.6}
          r={0.9}
          fill={palette.glow}
        />

        {/* chest glyphs based on archetype & cloakStyle */}
        {cloakStyle !== "trail" && (
          <>
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
