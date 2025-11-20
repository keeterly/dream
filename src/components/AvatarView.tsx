import React from "react";
import "./AvatarView.css";

interface AvatarViewProps {
  avatar: any;   // AvatarConfig from profile
  traits?: any;  // DreamTraits (optional)
  dreamName?: string;
}

/* ---------- helpers ---------- */

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
  return hashToInt(seed || "default", 4);
}

/* ---------- geometry for body + sleeves ---------- */

function getBodyGeometry(avatar: any, traits?: any, dreamName?: string) {
  const bodyType = getBodyType(avatar);
  const temperamentTags: string[] = traits?.temperamentTags || [];
  const variantIndex = getVariantIndex(avatar, traits, dreamName);

  const width = 120;
  const height = 200;

  const centerX = width / 2;
  const feetY = 182;

  // how tall the robe is from shoulders to hem
  let robeHeight = 112;
  if (bodyType === "tall") robeHeight = 120;
  if (bodyType === "compact") robeHeight = 106;

  // base width of the cloak at hem
  let baseWidth = 74;
  if (bodyType === "slim") baseWidth = 68;
  if (bodyType === "compact") baseWidth = 64;

  let lean = 0;
  const tags = temperamentTags.map(normalizeKey);
  if (tags.includes("bold") || tags.includes("impulsive")) lean += 2;
  if (tags.includes("guarded") || tags.includes("cautious")) lean -= 1;

  if (variantIndex === 1) robeHeight += 2;
  if (variantIndex === 2) robeHeight -= 2;

  const headCenterY = feetY - robeHeight - 28;        // slightly higher head
  const shoulderY = headCenterY + 22;                 // shoulders just below hood
  const wristY = shoulderY + robeHeight * 0.45;       // end of sleeves

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

/* ---------- face / mask ---------- */

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

  let details: React.ReactNode = null;

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

  return (
    <>
      {base}
      {details}
    </>
  );
}

/* ---------- robe glyphs ---------- */

function renderAccentGlyphs(
  avatar: any,
  palettes: ReturnType<typeof getPalettes>,
  cx: number,
  feetY: number,
  robeHeight: number,
  baseWidth: number,
  lean: number
) {
  const glyphs = getAccentGlyphs(avatar).map(normalizeKey);
  const x = cx + lean;
  const waistY = feetY - robeHeight * 0.45;
  const hemY = feetY - 6;

  const nodes: React.ReactNode[] = [];

  // belt
  nodes.push(
    <path
      key="belt"
      d={`
        M ${x - baseWidth * 0.25}, ${waistY}
        L ${x + baseWidth * 0.25}, ${waistY}
      `}
      fill="none"
      stroke={palettes.trim}
      strokeWidth={1.2}
    />
  );

  glyphs.forEach((g) => {
    if (g === "seer_eye") {
      nodes.push(
        <circle
          key="seer_eye_outer"
          cx={x}
          cy={waistY}
          r={3.6}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
      nodes.push(
        <circle
          key="seer_eye_inner"
          cx={x}
          cy={waistY}
          r={1.9}
          fill={palettes.accent}
        />
      );
    } else if (g === "ring_aura") {
      nodes.push(
        <circle
          key="ring_aura"
          cx={x}
          cy={feetY - robeHeight * 0.3}
          r={4.6}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    } else if (g === "geo_lines") {
      nodes.push(
        <path
          key="geo_lines"
          d={`
            M ${x - 8}, ${hemY - 10} L ${x - 8}, ${hemY}
            M ${x}, ${hemY - 14}  L ${x}, ${hemY}
            M ${x + 8}, ${hemY - 10} L ${x + 8}, ${hemY}
          `}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1.1}
        />
      );
    } else if (g === "grid_fragment") {
      nodes.push(
        <rect
          key="grid_fragment"
          x={x - 9}
          y={waistY - 5}
          width={18}
          height={10}
          rx={3}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    } else if (g === "path_curve") {
      nodes.push(
        <path
          key="path_curve"
          d={`
            M ${x - 10}, ${feetY - robeHeight * 0.35}
            Q ${x}, ${feetY - robeHeight * 0.2}
              ${x + 10}, ${feetY - robeHeight * 0.12}
          `}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    } else if (g === "footstep") {
      nodes.push(
        <path
          key="footstep"
          d={`
            M ${x - 4}, ${hemY - 7} L ${x - 4}, ${hemY - 2}
            M ${x + 4}, ${hemY - 9} L ${x + 4}, ${hemY - 3}
          `}
          fill="none"
          stroke={palettes.accent}
          strokeWidth={1}
        />
      );
    }
  });

  return nodes;
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

  return (
    <div className="avatar-view-root">
      <svg
        className="avatar-view-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Dreamself avatar"
      >
        {/* no background rect – world art shows through */}

        {/* ground shadow */}
        <ellipse
          cx={x}
          cy={feetY + 3}
          rx={halfBase * 0.4}
          ry={6}
          fill="rgba(0,0,0,0.7)"
        />

        {/* legs */}
        <g fill="#050509" opacity={0.9}>
          <rect x={x - 7} y={feetY - 24} width={6} height={24} rx={2} />
          <rect x={x + 1} y={feetY - 24} width={6} height={24} rx={2} />
        </g>

        {/* sleeves / arms */}
        <g fill={palettes.robe} stroke={palettes.trim} strokeWidth={1.2}>
          {/* left sleeve */}
          <path
            d={`
              M ${x - halfBase * 0.45}, ${shoulderY}
              L ${x - halfBase * 0.75}, ${wristY}
              L ${x - halfBase * 0.55}, ${wristY}
              L ${x - halfBase * 0.35}, ${shoulderY + 4}
              Z
            `}
          />
          {/* right sleeve */}
          <path
            d={`
              M ${x + halfBase * 0.45}, ${shoulderY}
              L ${x + halfBase * 0.75}, ${wristY}
              L ${x + halfBase * 0.55}, ${wristY}
              L ${x + halfBase * 0.35}, ${shoulderY + 4}
              Z
            `}
          />
        </g>

        {/* main triangular / split-front robe */}
        {cloakStyle !== "split_front" && (
          <path
            d={`
              M ${x}, ${shoulderY}
              L ${x - halfBase}, ${feetY - 4}
              L ${x + halfBase}, ${feetY - 4}
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
                L ${x - halfBase * 0.95}, ${feetY - 4}
                L ${x - 5}, ${feetY - 4}
                Z
              `}
              fill={palettes.robe}
              stroke={palettes.trim}
              strokeWidth={1.6}
            />
            <path
              d={`
                M ${x}, ${shoulderY}
                L ${x + 5}, ${feetY - 4}
                L ${x + halfBase * 0.95}, ${feetY - 4}
                Z
              `}
              fill={palettes.robe}
              stroke={palettes.trim}
              strokeWidth={1.6}
            />
          </>
        )}

        {/* cape overlay for cape_heavy */}
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
            strokeWidth={1.2}
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

        {/* head under hood */}
        <circle cx={x} cy={headCenterY + 3} r={9} fill={palettes.inner} />

        {/* mask / face */}
        {renderMask(avatar, palettes, centerX, headCenterY + 2, lean, variantIndex)}

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

        {/* robe glyphs */}
        {renderAccentGlyphs(
          avatar,
          palettes,
          centerX,
          feetY,
          robeHeight,
          baseWidth,
          lean
        )}

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
      </svg>
    </div>
  );
};

export default AvatarView;
