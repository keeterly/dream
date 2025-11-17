import React from "react";
import { AvatarConfig } from "../types";
import "./AvatarView.css";

interface Props {
  avatar: AvatarConfig;
}

const AvatarView: React.FC<Props> = ({ avatar }) => {
  const {
    primaryPalette,
    secondaryPalette,
    bodyType,
    posture,
    headShape,
    faceDetailLevel,
    companionType,
    caveMarking,
  } = avatar;

  const bodyScaleY = bodyType === "tall" ? 1.2 : bodyType === "compact" ? 0.9 : 1.0;
  const postureOffsetX =
    posture === "forward-leaning" ? 4 : posture === "relaxed" ? -2 : 0;

  const headRadius =
    headShape === "angular" ? 9 : headShape === "soft" ? 11 : 10;

  const faceOpacity = faceDetailLevel === "minimal" ? 0.15 : 0.4;

  const hasShadowCloak = caveMarking === "cloak_shadow";
  const hasMotionStance = caveMarking === "stance_motion";
  const hasMemorySigil = caveMarking === "sigil_memory";

  const companion = (() => {
    if (!companionType) return null;
    const baseY = 62;
    const baseX = 78;
    if (companionType === "bird") {
      return (
        <circle
          cx={baseX}
          cy={baseY}
          r={3}
          fill={secondaryPalette}
          opacity={0.9}
        />
      );
    }
    if (companionType === "fox") {
      return (
        <rect
          x={baseX - 3}
          y={baseY - 2}
          width={6}
          height={4}
          rx={1}
          fill={secondaryPalette}
          opacity={0.9}
        />
      );
    }
    return (
      <ellipse
        cx={baseX}
        cy={baseY + 3}
        rx={5}
        ry={2}
        fill={secondaryPalette}
        opacity={0.4}
      />
    );
  })();

  return (
    <div className="avatar-container">
      <svg
        className="avatar-svg"
        viewBox="0 0 120 120"
        role="img"
        aria-label="Dreamself avatar"
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor={secondaryPalette} stopOpacity={0.5} />
            <stop offset="60%" stopColor={primaryPalette} stopOpacity={0.15} />
            <stop offset="100%" stopColor="#02030A" stopOpacity={1} />
          </radialGradient>
        </defs>

        <rect width="120" height="120" fill="url(#bgGrad)" rx={16} />

        <ellipse
          cx={60 + postureOffsetX}
          cy={88}
          rx={18}
          ry={4}
          fill="#000000"
          opacity={0.35}
        />

        {hasShadowCloak && (
          <path
            d={`M ${40 + postureOffsetX} 46
                Q 60 110 80 46
                Q 60 70 ${40 + postureOffsetX} 46`}
            fill="#000000"
            opacity={0.35}
          />
        )}

        <g transform={`scale(1, ${bodyScaleY}) translate(0, ${8 - 10 * (bodyScaleY - 1)})`}>
          <path
            d={`M ${48 + postureOffsetX} 50
                Q 60 90 ${72 + postureOffsetX} 50
                Q 60 42 ${48 + postureOffsetX} 50`}
            fill={primaryPalette}
            opacity={0.95}
          />
          {hasMotionStance && (
            <path
              d={`M ${60 + postureOffsetX} 60
                  L ${68 + postureOffsetX} 80
                  L ${56 + postureOffsetX} 80 Z`}
              fill={secondaryPalette}
              opacity={0.6}
            />
          )}
        </g>

        <circle
          cx={60 + postureOffsetX}
          cy={40}
          r={headRadius}
          fill={primaryPalette}
        />

        {faceDetailLevel !== "minimal" && (
          <g opacity={faceOpacity}>
            <ellipse
              cx={56 + postureOffsetX}
              cy={39}
              rx={2}
              ry={1.4}
              fill="#050608"
            />
            <ellipse
              cx={64 + postureOffsetX}
              cy={39}
              rx={2}
              ry={1.4}
              fill="#050608"
            />
            <path
              d={`M ${56 + postureOffsetX} 44
                  Q ${60 + postureOffsetX} 46 ${64 + postureOffsetX} 44`}
              stroke="#050608"
              strokeWidth={0.8}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {hasMemorySigil && (
          <g opacity={0.7}>
            <circle
              cx={60 + postureOffsetX}
              cy={64}
              r={4}
              fill="none"
              stroke={secondaryPalette}
              strokeWidth={1}
            />
            <path
              d={`M ${60 + postureOffsetX} 60
                  L ${60 + postureOffsetX} 68`}
              stroke={secondaryPalette}
              strokeWidth={0.8}
            />
          </g>
        )}

        {companion}

        <line
          x1={20}
          y1={20}
          x2={44}
          y2={28}
          stroke={secondaryPalette}
          strokeWidth={0.8}
          strokeDasharray="3 2"
          opacity={0.7}
        />
      </svg>
    </div>
  );
};

export default AvatarView;
