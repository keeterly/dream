import React from "react";
import "./AvatarView.css";

interface AvatarViewProps {
  avatar: any;
  traits?: any;
  dreamName?: string;
}

/* ---------- tiny deterministic helpers ---------- */

function normalizeKey(value: unknown): string {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
}

// FNV-ish hash -> [0, 1)
function hashToUnit(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function hashToInt(str: string, max: number): number {
  return Math.floor(hashToUnit(str) * max);
}

/* ---------- derive archetype / element from traits & name ---------- */

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

function getArchetypeKey(avatar: any, traits?: any, dreamName?: string) {
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
  for (const c of candidates) {
    const k = normalizeKey(c);
    if (k) return k;
  }
  return "seer";
}

function getElementKey(avatar: any, traits?: any, dreamName?: string) {
  const fromName = splitDreamName(dreamName).element;
  const candidates = [
    avatar?.elementKey,
    avatar?.primaryElement,
    avatar?.element,
    traits?.dominantElement,
    traits?.primaryElement,
    traits?.elementKey,
    traits?.element,
    fromName,
  ];
  for (const c of candidates) {
    const k = normalizeKey(c);
    if (k) return k;
  }
  return "glass";
}

/* ---------- palettes per element ---------- */

function getPalette(elementKey: string) {
  const palettes: Record<
    string,
    { robe: string; trim: string; glow: string; accent: string; inner: string }
  > = {
    ember: {
      robe: "#3a1b14",
      trim: "#fbb076",
      glow: "#ffb977",
      accent: "#ff7a3c",
      inner: "#160d0b",
    },
    glass: {
      robe: "#111827",
      trim: "#c4d9ff",
      glow: "#a4daff",
      accent: "#7bb3ff",
      inner: "#05070f",
    },
    shadow: {
      robe: "#151322",
      trim: "#c7b6ff",
      glow: "#b6a0ff",
      accent: "#7b5bff",
      inner: "#05030b",
    },
    bloom: {
      robe: "#1f2c22",
      trim: "#b5e3c2",
      glow: "#baf5d1",
      accent: "#7fd9a5",
      inner: "#060a07",
    },
    aether: {
      robe: "#1e1b2e",
      trim: "#e0d6ff",
      glow: "#d5c8ff",
      accent: "#b29bff",
      inner: "#06040b",
    },
  };

  if (elementKey.startsWith("fire") || elementKey === "ember") return palettes.ember;
  if (elementKey.startsWith("glass")) return palettes.glass;
  if (elementKey.startsWith("shadow") || elementKey.startsWith("night"))
    return palettes.shadow;
  if (elementKey.startsWith("bloom") || elementKey.startsWith("growth"))
    return palettes.bloom;
  if (elementKey.startsWith("aether") || elementKey.startsWith("void"))
    return palettes.aether;

  return palettes[elementKey] || palettes.glass;
}

/* ---------- cloak body geometry for humanoid ---------- */

function getBodyGeometry(
  archetypeKey: string,
  variantIndex: number,
  temperamentTags: string[]
) {
  // Canvas is 0..120 wide, 0..200 tall
  let centerX = 60;
  let feetY = 180;
  let cloakWidth = 60;
  let cloakHeight = 110;
  let lean = 0;

  if (archetypeKey === "architect") {
    cloakWidth = 64;
    cloakHeight = 112;
  } else if (archetypeKey === "seer") {
    cloakWidth = 54;
    cloakHeight = 115;
  } else if (archetypeKey === "wanderer") {
    cloakWidth = 58;
    cloakHeight = 118;
    lean = 3;
  }

  // Temperament influences posture a bit
  const tags = temperamentTags.map(normalizeKey);
  if (tags.includes("guarded") || tags.includes("cautious")) {
    lean -= 2;
  }
  if (tags.includes("bold") || tags.includes("impulsive")) {
    lean += 2;
  }

  // Variant tweak
  if (variantIndex === 1) {
    cloakHeight += 4;
  } else if (variantIndex === 2) {
    cloakHeight -= 4;
  }

  const headY = feetY - cloakHeight - 26; // hood center
  return { centerX, feetY, cloakWidth, cloakHeight, headY, lean };
}

/* ---------- mask variants ---------- */

function renderMask(
  archetypeKey: string,
  palette: ReturnType<typeof getPalette>,
  cx: number,
  cy: number,
  lean: number,
  variantIndex: number
) {
  const x = cx + lean;

  if (archetypeKey === "architect") {
    const eyeCount = variantIndex % 2 === 0 ? 2 : 3;
    const spacing = 2.4;
    const eyes = [];
    const start = -spacing * (eyeCount - 1) * 0.5;
    for (let i = 0; i < eyeCount; i++) {
      eyes.push(
        <circle
          key={i}
          cx={x + start + i * spacing}
          cy={cy - 0.5}
          r={0.9}
          fill={palette.glow}
        />
      );
    }

    return (
      <>
        <circle
          cx={x}
          cy={cy}
          r={7}
          fill={palette.inner}
          stroke={palette.glow}
          strokeWidth={1}
        />
        {eyes}
      </>
    );
  }

  if (archetypeKey === "seer") {
    const style = variantIndex % 3; // dot / slit / crescent
    const almond = (
      <path
        d={`
          M ${x - 7}, ${cy}
          Q ${x}, ${cy - 4.8} ${x + 7}, ${cy}
          Q ${x}, ${cy + 4.8} ${x - 7}, ${cy}
        `}
        fill={palette.inner}
        stroke={palette.glow}
        strokeWidth={1}
      />
    );

    if (style === 0) {
      return (
        <>
          {almond}
          <circle cx={x} cy={cy} r={2.4} fill={palette.glow} />
        </>
      );
    }
    if (style === 1) {
      return (
        <>
          {almond}
          <rect
            x={x - 1}
            y={cy - 3}
            width={2}
            height={6}
            rx={1}
            fill={palette.glow}
          />
        </>
      );
    }
    return (
      <>
        {almond}
        <path
          d={`
            M ${x - 3.5}, ${cy - 1.2}
            Q ${x}, ${cy + 1.8} ${x + 3.5}, ${cy - 1.2}
          `}
          fill="none"
          stroke={palette.glow}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      </>
    );
  }

  if (archetypeKey === "wanderer") {
    const extra = variantIndex % 3 === 0;
    return (
      <>
        <ellipse
          cx={x}
          cy={cy}
          rx={4.6}
          ry={7.2}
          fill={palette.inner}
          stroke={palette.glow}
          strokeWidth={1}
        />
        <rect
          x={x - 0.8}
          y={cy - 4.5}
          width={1.6}
          height={9}
          rx={0.8}
          fill={palette.glow}
        />
        {extra && (
          <rect
            x={x + 2.2}
            y={cy - 2}
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

  // fallback
  return (
    <circle
      cx={x}
      cy={cy}
      r={6.6}
      fill={palette.inner}
      stroke={palette.glow}
      strokeWidth={1}
    />
  );
}

/* ---------- main AvatarView ---------- */

export const AvatarView: React.FC<AvatarViewProps> = ({
  avatar,
  traits,
  dreamName,
}) => {
  const archetypeKey = getArchetypeKey(avatar, traits, dreamName);
  const elementKey = getElementKey(avatar, traits, dreamName);
  const palette = getPalette(elementKey);

  const temperamentTags: string[] = traits?.temperamentTags || [];

  // Seed string for deterministic variation
  const seedString =
    (avatar?.seed || "") +
    "|" +
    (dreamName || "") +
    "|" +
    (traits?.primaryArchetype || "") +
    "|" +
    (traits?.dominantElement || "");

  const variantIndex = hashToInt(seedString, 4); // 0–3

  const { centerX, feetY, cloakWidth, cloakHeight, headY, lean } =
    getBodyGeometry(archetypeKey, variantIndex, temperamentTags);

  const halfW = cloakWidth / 2;
  const hoodTopY = headY - 14;
  const hoodBottomY = headY + 10;

  const hasCompanion =
    normalizeKey(avatar?.companionType) !== "" &&
    normalizeKey(avatar?.companionType) !== "none";

  return (
    <div className="avatar-view-root">
      <svg
        className="avatar-view-svg"
        viewBox="0 0 120 200"
        role="img"
        aria-label="Dreamself avatar"
      >
        {/* world lighting halo */}
        <defs>
          <radialGradient id="avatarGlow" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor={palette.glow} stopOpacity="0.85" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={120}
          height={200}
          fill="url(#avatarGlow)"
          opacity={0.65}
        />

        {/* ground shadow */}
        <ellipse
          cx={centerX + lean * 0.8}
          cy={feetY + 4}
          rx={halfW * 0.9}
          ry={7}
          fill="rgba(0,0,0,0.75)"
          style={{ filter: "blur(3px)" }}
        />

        {/* legs (simple silhouette) */}
        <g fill="#050509" opacity={0.95}>
          <rect
            x={centerX - 8 + lean}
            y={feetY - 20}
            width={6}
            height={20}
            rx={2}
          />
          <rect
            x={centerX + 2 + lean}
            y={feetY - 20}
            width={6}
            height={20}
            rx={2}
          />
        </g>

        {/* cloak body */}
        <path
          d={`
          M ${centerX - halfW + lean}, ${feetY - cloakHeight + 18}
          Q ${centerX + lean}, ${feetY - cloakHeight - 6}
            ${centerX + halfW + lean}, ${feetY - cloakHeight + 18}
          L ${centerX + halfW * 0.8 + lean}, ${feetY - 10}
          Q ${centerX + lean}, ${feetY} ${
          centerX - halfW * 0.8 + lean
        }, ${feetY - 10}
          Z
        `}
          fill={palette.robe}
          stroke={palette.trim}
          strokeWidth={1.6}
        />

        {/* shoulder / cape line */}
        <path
          d={`
          M ${centerX - halfW * 0.9 + lean}, ${headY + 16}
          Q ${centerX + lean}, ${headY + 4}
            ${centerX + halfW * 0.9 + lean}, ${headY + 16}
        `}
          fill="none"
          stroke={palette.trim}
          strokeWidth={1.2}
          opacity={0.9}
        />

        {/* hood outline */}
        <path
          d={`
          M ${centerX - 13 + lean}, ${hoodBottomY}
          Q ${centerX + lean}, ${hoodTopY}
            ${centerX + 13 + lean}, ${hoodBottomY}
        `}
          fill="none"
          stroke={palette.trim}
          strokeWidth={1.3}
        />

        {/* head silhouette under hood */}
        <circle
          cx={centerX + lean}
          cy={headY + 3}
          r={8.5}
          fill={palette.inner}
        />

        {/* mask / face */}
        {renderMask(
          archetypeKey,
          palette,
          centerX,
          headY + 2,
          lean,
          variantIndex
        )}

        {/* belt and glyphs */}
        <g opacity={0.92}>
          {/* base belt */}
          <path
            d={`
            M ${centerX - halfW * 0.7 + lean}, ${
              feetY - cloakHeight * 0.45
            }
            L ${centerX + halfW * 0.7 + lean}, ${
              feetY - cloakHeight * 0.45
            }
          `}
            fill="none"
            stroke={palette.trim}
            strokeWidth={1}
          />

          {archetypeKey === "architect" && (
            <>
              {/* center buckle + pendant */}
              <rect
                x={centerX - 7 + lean}
                y={feetY - cloakHeight * 0.47}
                width={14}
                height={6}
                rx={3}
                fill="none"
                stroke={palette.accent}
                strokeWidth={1}
              />
              <circle
                cx={centerX + lean}
                cy={feetY - cloakHeight * 0.3}
                r={4}
                fill="none"
                stroke={palette.accent}
                strokeWidth={1}
              />
              <line
                x1={centerX + lean}
                y1={feetY - cloakHeight * 0.36}
                x2={centerX + lean}
                y2={feetY - cloakHeight * 0.33}
                stroke={palette.accent}
                strokeWidth={1}
              />
              {/* hem lines */}
              <path
                d={`
                M ${centerX - 6 + lean}, ${feetY - 14}
                L ${centerX - 6 + lean}, ${feetY - 4}
              `}
                stroke={palette.accent}
                strokeWidth={1}
              />
              <path
                d={`
                M ${centerX + lean}, ${feetY - 14}
                L ${centerX + lean}, ${feetY - 3}
              `}
                stroke={palette.accent}
                strokeWidth={1}
              />
              <path
                d={`
                M ${centerX + 6 + lean}, ${feetY - 14}
                L ${centerX + 6 + lean}, ${feetY - 4}
              `}
                stroke={palette.accent}
                strokeWidth={1}
              />
            </>
          )}

          {archetypeKey === "seer" && (
            <>
              {/* circular focus at center */}
              <circle
                cx={centerX + lean}
                cy={feetY - cloakHeight * 0.44}
                r={3.2}
                fill="none"
                stroke={palette.accent}
                strokeWidth={1}
              />
              {variantIndex % 2 === 0 && (
                <circle
                  cx={centerX + lean}
                  cy={feetY - cloakHeight * 0.44}
                  r={1.6}
                  fill={palette.accent}
                />
              )}
              {/* vertical glyph */}
              <path
                d={`
                M ${centerX + lean}, ${feetY - cloakHeight * 0.4}
                L ${centerX + lean}, ${feetY - cloakHeight * 0.24}
              `}
                stroke={palette.accent}
                strokeWidth={1}
              />
            </>
          )}

          {archetypeKey === "wanderer" && (
            <>
              {/* flowing belt curve */}
              <path
                d={`
                M ${centerX - 10 + lean}, ${feetY - cloakHeight * 0.45}
                Q ${centerX + lean}, ${feetY - cloakHeight * 0.4}
                  ${centerX + 10 + lean}, ${feetY - cloakHeight * 0.45}
              `}
                fill="none"
                stroke={palette.accent}
                strokeWidth={1}
              />
              {/* single long path glyph */}
              <path
                d={`
                M ${centerX + lean}, ${feetY - cloakHeight * 0.38}
                Q ${centerX + 6 + lean}, ${feetY - cloakHeight * 0.2}
                  ${centerX + lean}, ${feetY - cloakHeight * 0.05}
              `}
                fill="none"
                stroke={palette.accent}
                strokeWidth={1}
              />
            </>
          )}
        </g>

        {/* optional companion as little floating light */}
        {hasCompanion && (
          <>
            <ellipse
              cx={centerX + halfW + 12 + lean}
              cy={feetY - 12}
              rx={7}
              ry={3}
              fill="rgba(0,0,0,0.7)"
              style={{ filter: "blur(2px)" }}
            />
            <rect
              x={centerX + halfW + 7 + lean}
              y={feetY - cloakHeight * 0.25}
              width={10}
              height={18}
              rx={3}
              fill={palette.inner}
              stroke={palette.glow}
              strokeWidth={1}
            />
            <circle
              cx={centerX + halfW + 12 + lean}
              cy={feetY - cloakHeight * 0.21}
              r={3.6}
              fill={palette.glow}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default AvatarView;
