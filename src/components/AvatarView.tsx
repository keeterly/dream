import React from "react";

interface AvatarViewProps {
  // You can tighten this type later if you like,
  // but it's not needed for the current SVG rendering.
  avatar: unknown;
  compact?: boolean;
}

const AvatarView: React.FC<AvatarViewProps> = ({ avatar, compact }) => {
  const svgClass = compact ? "avatar-svg avatar-svg--compact" : "avatar-svg";

  return (
    <svg
      className={svgClass}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* background tile */}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="104" height="104" rx="24" fill="url(#bg)" />

      {/* Simple VENIA-ish figure */}
      <circle cx="60" cy="44" r="10" fill="#e5e7eb" opacity={0.95} />
      <path d="M40 86 L60 48 L80 86 Z" fill="#e5e7eb" opacity={0.9} />
    </svg>
  );
};

export default AvatarView;
