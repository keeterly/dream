import React from "react";
import "./AvatarView.css";

interface AvatarViewProps {
  avatar: any;   // DreamselfProfile.avatar (AvatarConfig)
  traits?: any;  // DreamTraits (optional, for extra nuance later)
  dreamName?: string;
}

/** Small helpers */

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
  return Math.floor(hashToUnit(str) * max);
}

/** Pull knobs from AvatarConfig */

function getBodyType(avatar: any): "slim" | "tall" | "compact" {
  const t = normalizeKey(avatar?.bodyType);
  if (t === "tall") return "tall";
  if (t === "compact") return "compact";
  return "slim";
}

function getPosture(avatar: any): "upright" | "forward-leaning" | "stooped" {
  const t = normalizeKey(avatar?.posture);
  if (t === "forward-leaning") return "forward-leaning";
  if (t === "stooped") return "stooped";
  return "upright";
}

function getHeadShape(
  avatar: any
): "oval" | "angular" | "soft" {
  const t = normalizeKey(avatar?.headShape);
  if (t === "angular") return "angular";
  if (t === "soft") return "soft";
  return "oval";
}

function getFaceDetail(avatar: any): "minimal" | "medium" | "ornate" {
  const t = normalizeKey(avatar?.faceDetailLevel);
  if (t === "minimal" || t === "ornate") return t;
  return "medium";
}

function getCloakStyle(
  avatar: any
): "mantle_open" | "structured" | "asym_trail" {
  const t = normalizeKey(avatar?.cloakStyle);
  if (t === "structured") return "structured";
  if (t === "asym_trail") return "asym_trail";
  return "mantle_open";
}

function getAccentGlyphs(avatar: any): string[] {
  return Array.isArray(avatar?.accentGlyphs) ? avatar.accentGlyphs : [];
}

function getPalettes(avatar: any) {
  const robe = avatar?.primaryPalette || "#111827";
  const accent = avatar?.secondaryPalette || "#c4d9ff";

  // simple derived glow: mix accent with white a bit
  const glow = "#ffffff";
  const inner = "#05060b";

  return { robe, accent, trim: accent, glow, inner };
}

function getVariantIndex(avatar: any, traits?: any, dreamName?: string) {
  const seedString =
    (avatar?.seed || "") +
    "|" +
    (dreamName || "") +
    "|" +
    (traits?.primaryArchetype || "") +
    "|" +
    (traits?.dominantElement || "");
  return hashToInt(seedString || "default", 4); // 0–3
}

/** Geometry based on bodyType & posture */

function getBodyGeometry(
  avatar: any,
  traits?: any,
  dreamName?: string
) {
  const bodyType = getBodyType(avatar);
  const posture = getPosture(avatar);
  const temperamentTags: string[] = traits?.temperamentTags || [];
  const variantIndex = getVariantIndex(avatar, traits, dreamName);

  const canvasWidth = 120;
  const canvasHeight = 200;

  let centerX = canvasWidth / 2;
  let feetY = 180;
  let cloakWidth = 60;
  let cloakHeight = 110;
  let lean = 0;

  if (bodyType === "tall") {
    cloakHeight = 120;
  } else if (bodyType === "compact") {
    cloakWidth = 56;
    cloakHeight = 104;
  } else {
    // slim
    cloakWidth = 52;
  }

  if (posture === "forward-leaning") {
    lean += 3;
  } else if (posture === "stooped") {
    lean -= 2;
  }

  const tags = temperamentTags.map(normalizeKey);
  if (tags.includes("bold") || tags.includes("impulsive")) {
    lean += 1;
  }
  if (tags.includes("guarded") || tags.includes("cautious")) {
    lean -= 1;
  }

  if (variantIndex === 1) {
    cloakHeight += 4;
  } else if (variantIndex === 2) {
    cloakHeight -= 4;
  }

  const headCenterY = feetY - cloakHeight - 22;

  return {
    canvasWidth,
    canvasHeight,
    centerX,
    feetY,
    cloakWidth,
    cloakHeight,
    headCenterY,
    lean,
    variantIndex,
  };
}

/** Render mask using headShape + faceDetail */

function renderMask(
  avatar: any,
  palettes: ReturnType<typeof getPalettes>,
  cx: number,
  cy: number,
  lean: number,
  variantIndex: number
) {
  const headShape = getHeadShape(avatar);
  const faceDetail = getFaceDetail(avatar);
  const x = cx + lean;

  const baseMask =
    headShape === "angular" ? (
      <path
        d={`
          M ${x - 6}, ${cy - 6}
          L ${x + 6}, ${cy - 6}
          L ${x + 6.5}, ${cy + 5}
          L ${x - 6.5}, ${cy + 5}
          Z
        `}
        fill={palettes.inner}
        stroke={palettes.glow}
        strokeWidth={1}
      />
    ) : headShape === "soft" ? (
      <ellipse
        cx={x}
        cy={cy}
        rx={6.6}
        ry={7.2}
        fill={palettes.inner}
        stroke={palettes.glow}
        strokeWidth={1}
      />
    ) : (
      <circle
        cx={x}
        cy={cy}
        r={7}
        fill={palettes.inner}
        stroke={palettes.glow}
        strokeWidth={1}
      />
    );

  // eyes / face detail
  let details: React.ReactNode = null;

  if (faceDetail === "minimal") {
    details = (
      <circle
        cx={x}
        cy={cy}
        r={2.2}
        fill={palettes.glow}
      />
    );
  } else if (faceDetail === "medium") {
    details = (
      <>
        <circle
          cx={x - 2.4}
          cy={cy - 0.4}
          r={1}
          fill={palettes.glow}
        />
        <circle
          cx={x + 2.4}
          cy={cy - 0.4}
          r={1}
          fill={palettes.glow}
        />
      </>
    );
  } else {
    // ornate: variant decides pattern
    const style = variantIndex % 3;
    if (style === 0) {
      details = (
        <>
          <circle cx={x - 2.2} cy={cy - 0.6} r={1} fill={palettes.glow} />
          <circle cx={x + 2.2} cy={cy - 0.6} r={1} fill={palettes.glow} />
          <circle cx={x} cy={cy + 2.1} r={0.9} fill={palettes.glow} />
        </>
      );
    } else if (style === 1) {
      details = (
        <>
          <rect
            x={x - 1}
            y={cy - 3}
            width={2}
            height={6}
            rx={1}
            fill={palettes.glow}
          />
        </>
      );
    } else {
      details = (
        <>
          <path
            d={`
              M ${x - 3.5}, ${cy - 1.2}
              Q ${x}, ${cy + 2} ${x + 3.5}, ${cy - 1.2}
            `}
            fill="none"
            stroke={palettes.glow}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
        </>
      );
    }
  }

  return (
    <>
      {baseMask}
      {details}
    </>
  );
}

/** Use accentGlyphs → robe glyphs */

function renderAccentGlyphs(
  avatar: any,
  palettes: ReturnType<typeof getPalettes>,
  cx: number,
  feetY: number,
  cloakHeight: number,
  cloakWidth: number,
  lean: number
) {
  const glyphs: string[] = getAccentGlyphs(avatar);
  const x = cx + lean;

  const topBeltY = feetY - cloakHeight * 0.45;
  const hemY = feetY - 8;

  const out: React.ReactNode[] = [];

  // base belt
  out.push(
    <path
      key="belt"
      d={`
        M ${x - cloakWidth * 0.32}, ${topBeltY}
        L ${x + cloakWidth * 0.32}, ${topBeltY}
      `}
      fill="none"
      stroke={palettes.trim}
      strokeWidth={1}
    />
  );

  glyphs.forEach((g) => {
    const key = normalizeKey(g);
    if (key === "seer_eye") {
      out.push(
        <circle
          key="seer_eye_outer"
          cx={x}
          cy={topBeltY}
          r={3.2}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
      out.push(
        <circle
          key="seer_eye_inner"
          cx={x}
          cy={topBeltY}
          r={1.5}
          fill={palettes.accent}
        />
      );
    } else if (key === "ring_aura") {
      out.push(
        <circle
          key="ring_aura"
          cx={x}
          cy={feetY - cloakHeight * 0.3}
          r={4}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    } else if (key === "geo_lines") {
      out.push(
        <path
          key="geo_lines"
          d={`
            M ${x - 7}, ${hemY - 10}
            L ${x - 7}, ${hemY}
            M ${x}, ${hemY - 12}
            L ${x}, ${hemY}
            M ${x + 7}, ${hemY - 10}
            L ${x + 7}, ${hemY}
          `}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    } else if (key === "grid_fragment") {
      out.push(
        <rect
          key="grid_fragment"
          x={x - 8}
          y={topBeltY - 4}
          width={16}
          height={8}
          rx={3}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    } else if (key === "path_curve") {
      out.push(
        <path
          key="path_curve"
          d={`
            M ${x - 10}, ${feetY - cloakHeight * 0.25}
            Q ${x}, ${feetY - cloakHeight * 0.15}
              ${x + 10}, ${feetY - cloakHeight * 0.05}
          `}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    } else if (key === "footstep") {
      out.push(
        <path
          key="footstep"
          d={`
            M ${x - 4}, ${hemY - 6}
            L ${x - 4}, ${hemY - 2}
            M ${x + 4}, ${hemY - 8}
            L ${x + 4}, ${hemY - 3}
          `}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    }
  });

  return out;
}

/** Main component */

export const AvatarView: React.FC<AvatarViewProps> = ({
  avatar,
  traits,
  dreamName,
}) => {
  const palettes = getPalettes(avatar);
  const {
    canvasWidth,
    canvasHeight,
    centerX,
    feetY,
    cloakWidth,
    cloakHeight,
    headCenterY,
    lean,
    variantIndex,
  } = getBodyGeometry(avatar, traits, dreamName);

  const halfW = cloakWidth / 2;

  const cloakStyle = getCloakStyle(avatar);
  const hasCompanion =
    normalizeKey(avatar?.companionType) &&
    normalizeKey(avatar?.companionType) !== "none";

  const x = centerX + lean;

  return (
    <div className="avatar-view-root">
      <svg
        className="avatar-view-svg"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        role="img"
        aria-label="Dreamself avatar"
      >
        {/* background halo */}
        <defs>
          <radialGradient id="avatarGlow" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor={palettes.glow} stopOpacity="0.75" />
            <stop offset="100%" stopColor={palettes.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
          fill="url(#avatarGlow)"
          opacity={0.6}
        />

        {/* ground shadow */}
        <ellipse
          cx={x}
          cy={feetY + 4}
          rx={halfW * 0.9}
          ry={7}
          fill="rgba(0,0,0,0.75)"
          style={{ filter: "blur(3px)" }}
        />

        {/* legs */}
        <g fill="#050509" opacity={0.9}>
          <rect
            x={x - 8}
            y={feetY - 22}
            width={6}
            height={22}
            rx={2}
          />
          <rect
            x={x + 2}
            y={feetY - 22}
            width={6}
            height={22}
            rx={2}
          />
        </g>

        {/* cloak body */}
        <path
          d={`
          M ${x - halfW}, ${feetY - cloakHeight + 20}
          Q ${x}, ${feetY - cloakHeight - 4} ${x + halfW}, ${
            feetY - cloakHeight + 20
          }
          L ${x + halfW * 0.85}, ${feetY - 10}
          Q ${x}, ${feetY} ${x - halfW * 0.85}, ${feetY - 10}
          Z
        `}
          fill={palettes.robe}
          stroke={palettes.trim}
          strokeWidth={1.6}
        />

        {/* shoulder mantle */}
        <path
          d={`
          M ${x - halfW * 0.9}, ${headCenterY + 18}
          Q ${x}, ${headCenterY + 4} ${x + halfW * 0.9}, ${headCenterY + 18}
        `}
          fill="none"
          stroke={palettes.trim}
          strokeWidth={cloakStyle === "structured" ? 1.4 : 1.1}
          opacity={0.9}
        />

        {/* trailing cloak for asym_trail */}
        {cloakStyle === "asym_trail" && (
          <path
            d={`
            M ${x + halfW * 0.85}, ${feetY - 10}
            Q ${x + halfW * 1.2}, ${feetY - 2}
              ${x + halfW * 1.3}, ${feetY}
          `}
            fill="none"
            stroke={palettes.trim}
            strokeWidth={1.4}
          />
        )}

        {/* head under hood */}
        <circle
          cx={x}
          cy={headCenterY + 4}
          r={9}
          fill={palettes.inner}
        />

        {/* hood outline */}
        <path
          d={`
          M ${x - 14}, ${headCenterY + 12}
          Q ${x}, ${headCenterY - 6} ${x + 14}, ${headCenterY + 12}
        `}
          fill="none"
          stroke={palettes.trim}
          strokeWidth={1.3}
        />

        {/* mask / face */}
        {renderMask(avatar, palettes, centerX, headCenterY + 3, lean, variantIndex)}

        {/* robe glyphs from accentGlyphs */}
        {renderAccentGlyphs(
          avatar,
          palettes,
          centerX,
          feetY,
          cloakHeight,
          cloakWidth,
          lean
        )}

        {/* optional companion light */}
        {hasCompanion && (
          <>
            <ellipse
              cx={x + halfW + 12}
              cy={feetY - 10}
              rx={7}
              ry={3}
              fill="rgba(0,0,0,0.7)"
              style={{ filter: "blur(2px)" }}
            />
            <rect
              x={x + halfW + 7}
              y={feetY - cloakHeight * 0.25}
              width={10}
              height={18}
              rx={3}
              fill={palettes.inner}
              stroke={palettes.glow}
              strokeWidth={1}
            />
            <circle
              cx={x + halfW + 12}
              cy={feetY - cloakHeight * 0.21}
              r={3.5}
              fill={palettes.glow}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default AvatarView;
