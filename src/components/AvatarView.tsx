import React from "react";
import "./AvatarView.css";

interface AvatarViewProps {
  avatar: any;   // AvatarConfig-ish
  traits?: any;  // DreamTraits-ish
  dreamName?: string;
}

/* ---------- tiny helpers ---------- */

function normalizeKey(value: unknown): string {
  if (!value) return "";
  return value.toString().trim().toLowerCase();
}

function hashToUnit(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function hashToInt(str: string, max: number): number {
  return Math.floor(hashToUnit(str || "seed") * max);
}

/* ---------- AvatarConfig readers ---------- */

function getBodyType(avatar: any): "slim" | "tall" | "compact" {
  const k = normalizeKey(avatar?.bodyType);
  if (k === "tall") return "tall";
  if (k === "compact") return "compact";
  return "slim";
}

function getHeadShape(avatar: any): "oval" | "angular" | "soft" {
  const k = normalizeKey(avatar?.headShape);
  if (k === "angular") return "angular";
  if (k === "soft") return "soft";
  return "oval";
}

function getFaceDetail(avatar: any): "minimal" | "medium" | "ornate" {
  const k = normalizeKey(avatar?.faceDetailLevel);
  if (k === "minimal" || k === "ornate") return k;
  return "medium";
}

function getCloakStyle(
  avatar: any
): "triangular" | "split_front" | "cape_heavy" {
  const k = normalizeKey(avatar?.cloakStyle);
  if (k === "structured") return "split_front";
  if (k === "asym_trail") return "cape_heavy";
  return "triangular";
}

function getAccentGlyphs(avatar: any): string[] {
  return Array.isArray(avatar?.accentGlyphs) ? avatar.accentGlyphs : [];
}

function getPalettes(avatar: any) {
  const robe = avatar?.primaryPalette || "#161822";
  const accent = avatar?.secondaryPalette || "#c4d9ff";
  const trim = accent;
  const glow = "#fdfdfd";
  const inner = "#05060b";
  return { robe, accent, trim, glow, inner };
}

function getVariantIndex(avatar: any, traits?: any, dreamName?: string) {
  const seed =
    (avatar?.seed || "") +
    "|" +
    (dreamName || "") +
    "|" +
    (traits?.primaryArchetype || "") +
    "|" +
    (traits?.dominantElement || "");
  return hashToInt(seed || "default", 6);
}

/* ---------- trait readers ---------- */

function getPrimaryArchetype(traits?: any): "seer" | "architect" | "wanderer" | undefined {
  const k = normalizeKey(traits?.primaryArchetype);
  if (k === "seer" || k === "architect" || k === "wanderer") return k;
  return undefined;
}

function getSecondaryArchetype(traits?: any): "seer" | "architect" | "wanderer" | undefined {
  const k = normalizeKey(traits?.secondaryArchetype);
  if (k === "seer" || k === "architect" || k === "wanderer") return k;
  return undefined;
}

type ElementKey = "glass" | "shadow" | "ember" | "bloom" | "aether";

function getDominantElement(traits?: any): ElementKey | undefined {
  const k = normalizeKey(traits?.dominantElement) as ElementKey;
  if (k === "glass" || k === "shadow" || k === "ember" || k === "bloom" || k === "aether") {
    return k;
  }
  return undefined;
}

function getTemperamentTags(traits?: any): string[] {
  return Array.isArray(traits?.temperamentTags)
    ? traits.temperamentTags.map(normalizeKey)
    : [];
}

/* ---------- geometry ---------- */

function getBodyGeometry(avatar: any, traits?: any, dreamName?: string) {
  const bodyType = getBodyType(avatar);
  const temperamentTags: string[] = getTemperamentTags(traits);
  const variantIndex = getVariantIndex(avatar, traits, dreamName);

  const width = 120;
  const height = 200;

  const centerX = width / 2;
  const feetY = 182;

  let robeHeight = 118;
  if (bodyType === "tall") robeHeight = 126;
  if (bodyType === "compact") robeHeight = 110;

  let baseWidth = 76;
  if (bodyType === "slim") baseWidth = 70;
  if (bodyType === "compact") baseWidth = 66;

  let lean = 0;
  if (temperamentTags.includes("bold") || temperamentTags.includes("impulsive")) lean += 2;
  if (temperamentTags.includes("guarded") || temperamentTags.includes("cautious")) lean -= 1;

  if (variantIndex === 1) robeHeight += 2;
  if (variantIndex === 2) robeHeight -= 2;
  if (variantIndex === 3) baseWidth += 2;

  const headCenterY = feetY - robeHeight - 30;
  const shoulderY = headCenterY + 24;
  const wristY = shoulderY + robeHeight * 0.46;

  return {
    width,
    height,
    centerX,
    feetY,
    robeHeight,
    baseWidth,
    headCenterY,
    shoulderY,
    wristY,
    lean,
    variantIndex,
  };
}

/* ---------- sleeve styles ---------- */

type SleeveStyle = "straight" | "bell" | "angular";

function getSleeveStyle(traits?: any, variantIndex = 0): SleeveStyle {
  const tags = getTemperamentTags(traits);
  if (tags.includes("bold") || tags.includes("disruptive") || tags.includes("assertive")) {
    return "angular";
  }
  if (tags.includes("fluid") || tags.includes("kinetic") || tags.includes("sentimental")) {
    return "bell";
  }
  // small deterministic nudge
  if (variantIndex % 3 === 1) return "bell";
  if (variantIndex % 3 === 2) return "angular";
  return "straight";
}

/* ---------- mask / face ---------- */

function renderMask(
  avatar: any,
  traits: any,
  palettes: ReturnType<typeof getPalettes>,
  cx: number,
  cy: number,
  lean: number,
  variantIndex: number
) {
  const headShape = getHeadShape(avatar);
  const faceDetail = getFaceDetail(avatar);
  const arch = getPrimaryArchetype(traits);
  const x = cx + lean;

  let base: React.ReactNode;
  if (headShape === "angular") {
    base = (
      <path
        d={`
          M ${x - 7.5}, ${cy - 7}
          L ${x + 7.5}, ${cy - 7}
          L ${x + 7.5}, ${cy + 5}
          L ${x - 7.5}, ${cy + 5}
          Z
        `}
        fill={palettes.inner}
        stroke={palettes.glow}
        strokeWidth={1}
      />
    );
  } else if (headShape === "soft") {
    base = (
      <ellipse
        cx={x}
        cy={cy}
        rx={7.4}
        ry={8.1}
        fill={palettes.inner}
        stroke={palettes.glow}
        strokeWidth={1}
      />
    );
  } else {
    base = (
      <circle
        cx={x}
        cy={cy}
        r={7.4}
        fill={palettes.inner}
        stroke={palettes.glow}
        strokeWidth={1}
      />
    );
  }

  // archetype-driven detail
  let details: React.ReactNode = null;

  if (arch === "seer") {
    // iconic seer-eye motif
    if (faceDetail === "minimal") {
      details = <circle cx={x} cy={cy + 0.5} r={2.3} fill={palettes.glow} />;
    } else {
      details = (
        <>
          <path
            d={`
              M ${x - 5}, ${cy}
              Q ${x}, ${cy - 3.5}
                ${x + 5}, ${cy}
              Q ${x}, ${cy + 3.2}
                ${x - 5}, ${cy}
              Z
            `}
            fill="none"
            stroke={palettes.glow}
            strokeWidth={1.3}
          />
          <circle cx={x} cy={cy} r={1.6} fill={palettes.glow} />
        </>
      );
    }
  } else if (arch === "architect") {
    // vertical light slit + optional side dots
    details = (
      <>
        <rect
          x={x - 1.6}
          y={cy - 4.7}
          width={3.2}
          height={9.4}
          rx={1.6}
          fill={palettes.glow}
        />
        {faceDetail !== "minimal" && (
          <>
            <circle cx={x - 4.5} cy={cy} r={1} fill={palettes.glow} />
            <circle cx={x + 4.5} cy={cy} r={1} fill={palettes.glow} />
          </>
        )}
      </>
    );
  } else if (arch === "wanderer") {
    // crescent smile / wandering moon
    if (faceDetail === "minimal") {
      details = (
        <path
          d={`
            M ${x - 4}, ${cy - 0.5}
            Q ${x}, ${cy + 3.2}
              ${x + 4}, ${cy - 0.5}
          `}
          fill="none"
          stroke={palettes.glow}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      );
    } else {
      details = (
        <>
          <circle cx={x - 3.2} cy={cy - 0.3} r={1.1} fill={palettes.glow} />
          <circle cx={x + 3.2} cy={cy - 0.3} r={1.1} fill={palettes.glow} />
          <path
            d={`
              M ${x - 4.1}, ${cy + 2.2}
              Q ${x}, ${cy + 4.3}
                ${x + 4.1}, ${cy + 2.2}
            `}
            fill="none"
            stroke={palettes.glow}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </>
      );
    }
  } else {
    // generic fallback based on face detail
    if (faceDetail === "minimal") {
      details = <circle cx={x} cy={cy} r={2.2} fill={palettes.glow} />;
    } else if (faceDetail === "medium") {
      details = (
        <>
          <circle cx={x - 2.6} cy={cy} r={1.1} fill={palettes.glow} />
          <circle cx={x + 2.6} cy={cy} r={1.1} fill={palettes.glow} />
        </>
      );
    } else {
      const style = variantIndex % 3;
      if (style === 0) {
        details = (
          <>
            <circle cx={x - 3} cy={cy - 0.3} r={1.1} fill={palettes.glow} />
            <circle cx={x + 3} cy={cy - 0.3} r={1.1} fill={palettes.glow} />
            <circle cx={x} cy={cy + 2.6} r={1} fill={palettes.glow} />
          </>
        );
      } else if (style === 1) {
        details = (
          <rect
            x={x - 1.2}
            y={cy - 3.8}
            width={2.4}
            height={7.4}
            rx={1.2}
            fill={palettes.glow}
          />
        );
      } else {
        details = (
          <path
            d={`
              M ${x - 4}, ${cy - 1.3}
              Q ${x}, ${cy + 2.4} ${x + 4}, ${cy - 1.3}
            `}
            fill="none"
            stroke={palettes.glow}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        );
      }
    }
  }

  return (
    <>
      {base}
      {details}
    </>
  );
}

/* ---------- belt + glyphs ---------- */

function renderBelt(
  traits: any,
  palettes: ReturnType<typeof getPalettes>,
  cx: number,
  waistY: number,
  width: number
) {
  const arch = getSecondaryArchetype(traits);
  const x = cx;
  const half = width / 2;

  if (!arch) {
    // simple default belt
    return (
      <path
        d={`
          M ${x - half * 0.4}, ${waistY}
          L ${x + half * 0.4}, ${waistY}
        `}
        fill="none"
        stroke={palettes.trim}
        strokeWidth={1.2}
      />
    );
  }

  if (arch === "architect") {
    return (
      <>
        <path
          d={`
            M ${x - half * 0.42}, ${waistY}
            L ${x + half * 0.42}, ${waistY}
          `}
          fill="none"
          stroke={palettes.trim}
          strokeWidth={1.4}
        />
        <rect
          x={x - 7}
          y={waistY - 4}
          width={14}
          height={8}
          rx={3}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1.2}
        />
        <path
          d={`
            M ${x - 4}, ${waistY + 6}
            L ${x}, ${waistY + 11}
            L ${x + 4}, ${waistY + 6}
          `}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1.2}
        />
      </>
    );
  }

  if (arch === "seer") {
    return (
      <>
        <path
          d={`
            M ${x - half * 0.35}, ${waistY}
            L ${x + half * 0.35}, ${waistY}
          `}
          fill="none"
          stroke={palettes.trim}
          strokeWidth={1.2}
        />
        <circle
          cx={x}
          cy={waistY + 4}
          r={4}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1.1}
        />
        <circle cx={x} cy={waistY + 4} r={1.8} fill={palettes.accent} />
      </>
    );
  }

  // wanderer
  return (
    <>
      <path
        d={`
          M ${x - half * 0.43}, ${waistY - 1}
          Q ${x}, ${waistY + 3}
            ${x + half * 0.43}, ${waistY - 1}
        `}
        fill="none"
        stroke={palettes.trim}
        strokeWidth={1.2}
      />
      <path
        d={`
          M ${x - half * 0.45}, ${waistY + 2}
          Q ${x}, ${waistY + 6}
            ${x + half * 0.45}, ${waistY + 2}
        `}
        fill="none"
        stroke={palettes.trim}
        strokeWidth={1}
      />
    </>
  );
}

/* ---------- hem patterns (elements) ---------- */

function renderHemPattern(
  traits: any,
  palettes: ReturnType<typeof getPalettes>,
  cx: number,
  hemY: number,
  baseWidth: number
) {
  const elem = getDominantElement(traits);
  if (!elem) return null;

  const x = cx;
  const half = baseWidth / 2;
  const lineY = hemY - 6;

  if (elem === "glass") {
    // Glass: vertical crystal lines
    return (
      <g stroke={palettes.accent} strokeWidth={1} fill="none">
        <path d={`M ${x - 10}, ${lineY - 10} L ${x - 10}, ${lineY}`} />
        <path d={`M ${x}, ${lineY - 14} L ${x}, ${lineY}`} />
        <path d={`M ${x + 10}, ${lineY - 10} L ${x + 10}, ${lineY}`} />
        <circle cx={x} cy={lineY - 16} r={2.2} fill={palettes.accent} />
      </g>
    );
  }

  if (elem === "shadow") {
    // Shadow: chevrons / runes
    return (
      <g stroke={palettes.accent} strokeWidth={1} fill="none">
        <path
          d={`
            M ${x - half * 0.6}, ${lineY - 2}
            L ${x - half * 0.3}, ${lineY - 8}
            L ${x}, ${lineY - 2}
            L ${x + half * 0.3}, ${lineY - 8}
            L ${x + half * 0.6}, ${lineY - 2}
          `}
        />
      </g>
    );
  }

  if (elem === "ember") {
    // Ember: small flame triangles
    return (
      <g stroke={palettes.accent} strokeWidth={1} fill="none">
        <path
          d={`
            M ${x - 12}, ${lineY}
            L ${x - 8}, ${lineY - 10}
            L ${x - 4}, ${lineY}
            Z
          `}
        />
        <path
          d={`
            M ${x + 12}, ${lineY}
            L ${x + 8}, ${lineY - 10}
            L ${x + 4}, ${lineY}
            Z
          `}
        />
        <path
          d={`
            M ${x}, ${lineY}
            L ${x}, ${lineY - 12}
          `}
        />
      </g>
    );
  }

  if (elem === "bloom") {
    // Bloom: petal-like circles
    return (
      <g stroke={palettes.accent} strokeWidth={1} fill="none">
        <circle cx={x - 9} cy={lineY - 4} r={2.3} />
        <circle cx={x + 9} cy={lineY - 4} r={2.3} />
        <path
          d={`
            M ${x - 3}, ${lineY - 2}
            Q ${x}, ${lineY - 6}
              ${x + 3}, ${lineY - 2}
          `}
        />
      </g>
    );
  }

  // aether: simple ring + line
  return (
    <g stroke={palettes.accent} strokeWidth={1} fill="none">
      <circle cx={x} cy={lineY - 6} r={3.4} />
      <path d={`M ${x}, ${lineY - 10} L ${x}, ${lineY - 14}`} />
    </g>
  );
}

/* ---------- sleeves ---------- */

function renderSleeves(
  style: SleeveStyle,
  palettes: ReturnType<typeof getPalettes>,
  x: number,
  shoulderY: number,
  wristY: number,
  halfBase: number
) {
  if (style === "straight") {
    return (
      <g fill={palettes.robe} stroke={palettes.trim} strokeWidth={1.1}>
        <path
          d={`
            M ${x - halfBase * 0.4}, ${shoulderY}
            L ${x - halfBase * 0.58}, ${wristY}
            L ${x - halfBase * 0.48}, ${wristY}
            L ${x - halfBase * 0.3}, ${shoulderY + 3}
            Z
          `}
        />
        <path
          d={`
            M ${x + halfBase * 0.4}, ${shoulderY}
            L ${x + halfBase * 0.58}, ${wristY}
            L ${x + halfBase * 0.48}, ${wristY}
            L ${x + halfBase * 0.3}, ${shoulderY + 3}
            Z
          `}
        />
      </g>
    );
  }

  if (style === "angular") {
    return (
      <g fill={palettes.robe} stroke={palettes.trim} strokeWidth={1.2}>
        <path
          d={`
            M ${x - halfBase * 0.38}, ${shoulderY}
            L ${x - halfBase * 0.8}, ${wristY - 4}
            L ${x - halfBase * 0.55}, ${wristY}
            L ${x - halfBase * 0.26}, ${shoulderY + 1}
            Z
          `}
        />
        <path
          d={`
            M ${x + halfBase * 0.38}, ${shoulderY}
            L ${x + halfBase * 0.8}, ${wristY - 4}
            L ${x + halfBase * 0.55}, ${wristY}
            L ${x + halfBase * 0.26}, ${shoulderY + 1}
            Z
          `}
        />
      </g>
    );
  }

  // bell
  return (
    <g fill={palettes.robe} stroke={palettes.trim} strokeWidth={1.1}>
      <path
        d={`
          M ${x - halfBase * 0.36}, ${shoulderY}
          Q ${x - halfBase * 0.6}, ${shoulderY + (wristY - shoulderY) * 0.4}
            ${x - halfBase * 0.68}, ${wristY}
          L ${x - halfBase * 0.5}, ${wristY}
          Q ${x - halfBase * 0.46}, ${shoulderY + (wristY - shoulderY) * 0.4}
            ${x - halfBase * 0.28}, ${shoulderY + 3}
          Z
        `}
      />
      <path
        d={`
          M ${x + halfBase * 0.36}, ${shoulderY}
          Q ${x + halfBase * 0.6}, ${shoulderY + (wristY - shoulderY) * 0.4}
            ${x + halfBase * 0.68}, ${wristY}
          L ${x + halfBase * 0.5}, ${wristY}
          Q ${x + halfBase * 0.46}, ${shoulderY + (wristY - shoulderY) * 0.4}
            ${x + halfBase * 0.28}, ${shoulderY + 3}
          Z
        `}
      />
    </g>
  );
}

/* ---------- main component ---------- */

export const AvatarView: React.FC<AvatarViewProps> = ({
  avatar,
  traits,
  dreamName,
}) => {
  if (!avatar) return null;

  const palettes = getPalettes(avatar);
  const {
    width,
    height,
    centerX,
    feetY,
    robeHeight,
    baseWidth,
    headCenterY,
    shoulderY,
    wristY,
    lean,
    variantIndex,
  } = getBodyGeometry(avatar, traits, dreamName);

  const cloakStyle = getCloakStyle(avatar);
  const x = centerX + lean;
  const halfBase = baseWidth / 2;

  const hasCompanion =
    normalizeKey(avatar?.companionType) &&
    normalizeKey(avatar?.companionType) !== "none";

  const sleeveStyle = getSleeveStyle(traits, variantIndex);

  const waistY = feetY - robeHeight * 0.46;
  const hemY = feetY - 4;

  const glyphs = getAccentGlyphs(avatar).map(normalizeKey);

  return (
    <div className="avatar-view-root">
      <svg
        className="avatar-view-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Dreamself avatar"
      >
        {/* static ground shadow */}
        <ellipse
          cx={x}
          cy={feetY + 3}
          rx={halfBase * 0.42}
          ry={6}
          fill="rgba(0,0,0,0.7)"
        />

        <g className="avatar-figure">
          {/* legs */}
          <g className="avatar-legs" fill="#050509" opacity={0.9}>
            <rect x={x - 7} y={feetY - 24} width={6} height={24} rx={2} />
            <rect x={x + 1} y={feetY - 24} width={6} height={24} rx={2} />
          </g>

          {/* robe + sleeves + hood */}
          <g className="avatar-robe">
            {/* sleeves */}
            {renderSleeves(sleeveStyle, palettes, x, shoulderY, wristY, halfBase)}

            {/* main robe body */}
            {cloakStyle !== "split_front" && (
              <path
                d={`
                  M ${x}, ${shoulderY}
                  L ${x - halfBase}, ${hemY}
                  L ${x + halfBase}, ${hemY}
                  Z
                `}
                fill={palettes.robe}
                stroke={palettes.trim}
                strokeWidth={1.6}
              />
            )}

            {cloakStyle === "split_front" && (
              <>
                <path
                  d={`
                    M ${x}, ${shoulderY}
                    L ${x - halfBase * 0.96}, ${hemY}
                    L ${x - 5}, ${hemY}
                    Z
                  `}
                  fill={palettes.robe}
                  stroke={palettes.trim}
                  strokeWidth={1.6}
                />
                <path
                  d={`
                    M ${x}, ${shoulderY}
                    L ${x + 5}, ${hemY}
                    L ${x + halfBase * 0.96}, ${hemY}
                    Z
                  `}
                  fill={palettes.robe}
                  stroke={palettes.trim}
                  strokeWidth={1.6}
                />
              </>
            )}

            {/* cape overlay for "cape_heavy" archetypes */}
            {cloakStyle === "cape_heavy" && (
              <path
                d={`
                  M ${x - halfBase * 0.8}, ${shoulderY - 6}
                  Q ${x}, ${shoulderY - 18}
                    ${x + halfBase * 0.8}, ${shoulderY - 6}
                  L ${x + halfBase * 0.9}, ${feetY - robeHeight * 0.35}
                  Q ${x}, ${feetY - robeHeight * 0.2}
                    ${x - halfBase * 0.9}, ${feetY - robeHeight * 0.35}
                  Z
                `}
                fill={palettes.robe}
                stroke={palettes.trim}
                strokeWidth={1.1}
              />
            )}

            {/* hood outline */}
            <path
              d={`
                M ${x - 16}, ${headCenterY + 14}
                Q ${x}, ${headCenterY - 8}
                  ${x + 16}, ${headCenterY + 14}
              `}
              fill="none"
              stroke={palettes.trim}
              strokeWidth={1.4}
            />

            {/* head + mask */}
            <circle cx={x} cy={headCenterY + 3} r={9} fill={palettes.inner} />
            {renderMask(avatar, traits, palettes, centerX, headCenterY + 2, lean, variantIndex)}

            {/* shoulder fold */}
            <path
              d={`
                M ${x - halfBase * 0.7}, ${shoulderY}
                Q ${x}, ${shoulderY - 10}
                  ${x + halfBase * 0.7}, ${shoulderY}
              `}
              fill="none"
              stroke={palettes.trim}
              strokeWidth={1.2}
            />

            {/* belt */}
            {renderBelt(traits, palettes, centerX, waistY, baseWidth * 0.9)}

            {/* hem pattern by element */}
            {renderHemPattern(traits, palettes, centerX, hemY, baseWidth)}

            {/* optional accent glyphs still supported, lightly blended into torso */}
            {glyphs.length > 0 && (
              <g opacity={0.4}>
                {/* just reuse hem pattern logic space but higher on torso */}
                <circle
                  cx={centerX}
                  cy={waistY - 10}
                  r={3.4}
                  fill="none"
                  stroke={palettes.accent}
                  strokeWidth={1}
                />
              </g>
            )}
          </g>

          {/* companion mote */}
          {hasCompanion && (
            <>
              <ellipse
                cx={x + halfBase * 0.7}
                cy={feetY - 10}
                rx={6}
                ry={3}
                fill="rgba(0,0,0,0.7)"
              />
              <rect
                x={x + halfBase * 0.6 - 4}
                y={feetY - robeHeight * 0.25}
                width={8}
                height={16}
                rx={3}
                fill={palettes.inner}
                stroke={palettes.glow}
                strokeWidth={1}
              />
              <circle
                cx={x + halfBase * 0.6}
                cy={feetY - robeHeight * 0.25 + 4}
                r={3.2}
                fill={palettes.glow}
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

export default AvatarView;
