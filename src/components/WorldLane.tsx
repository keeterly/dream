import React from "react";
import AvatarView from "./AvatarView";
import { DreamselfProfile, TimeOfDayPhase } from "../types";

type EnvironmentId = "cave" | "ridge" | "field" | "shore" | "city";

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  environmentId: EnvironmentId;
  encounterItemName: string | null;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  profile,
  phase,
  environmentId,
  encounterItemName,
}) => {
  const phaseCopy =
    phase === "dawn"
      ? "Dawn"
      : phase === "noon"
      ? "High Noon"
      : phase === "dusk"
      ? "Dusk"
      : "Night";

  const laneClass = [
    "world-lane",
    `world-lane--${phase}`,
    `world-lane-env--${environmentId}`,
    encounterItemName ? "world-lane--encounter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={laneClass}>
      {/* sky + parallax silhouettes */}
      <div className="world-lane-sky" />
      <div className="world-lane-backdrop world-lane-backdrop--layer1" />
      <div className="world-lane-backdrop world-lane-backdrop--layer2" />

      {/* environment-specific shapes */}
      <div className={`world-lane-env world-lane-env-${environmentId}`} />

      {/* soft fog + analogue scanline texture */}
      <div className="world-lane-fog" />
      <div className="world-lane-overlay-noise" />

      {/* scrolling ribbon */}
      <div className="world-lane-track">
        <div className="world-lane-track-inner" />
        <div className="world-lane-track-inner world-lane-track-inner--two" />
      </div>

      {/* avatar in the middle of the ribbon */}
      <div className="world-lane-avatar-shell">
        <div className="world-lane-avatar-shadow" />
        <div className="world-lane-avatar-figure">
          {profile ? (
            <AvatarView avatar={profile.avatar} compact />
          ) : (
            <div className="world-lane-encounter-label">
              A silhouette waits for a name.
            </div>
          )}
        </div>

        {encounterItemName && (
          <div className="world-lane-encounter-ring" />
        )}
      </div>

      {/* encounter orb + label when something appears */}
      {encounterItemName && (
        <div className="world-lane-encounter">
          <div className="world-lane-encounter-orb" />
          <div className="world-lane-encounter-label">
            {encounterItemName} appears…
          </div>
        </div>
      )}

      {/* caption bottom-right */}
      <div className="world-lane-caption">
        <div className="world-lane-caption-title">
          {profile ? profile.dreamName : "Unnamed Dreamself"}
        </div>
        <div className="world-lane-caption-sub">
          Walking the ribbon at <span>{phaseCopy}</span>. Each bound VENIA
          piece will eventually drop new events along this path.
        </div>
      </div>

      {/* auto-walk tag */}
      <div className="world-lane-auto">AUTO · WALK</div>
    </div>
  );
};

export default WorldLane;
