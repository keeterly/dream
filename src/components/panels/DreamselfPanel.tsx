import React from "react";
import type { DreamselfProfile, InventoryItem } from "../../types";
import { AvatarView } from "../AvatarView";

export interface DreamselfPanelProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  onClose?: () => void;
}

export const DreamselfPanel: React.FC<DreamselfPanelProps> = ({
  profile,
  inventory,
  onClose,
}) => {
  const carriedRelics = inventory.filter(
    (item) => item.type === "relic" || item.slot === "relic"
  );

  return (
    <div className="world-panel world-panel-dreamself">
      {/* Unified header frame (matches Inventory) */}
      <div className="world-panel-header">
        <div>
          <div className="world-panel-kicker">Dreamself</div>
          <div className="world-panel-title">
            {profile.dreamName || "Dreamself"}
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="world-panel-modal-close"
            onClick={onClose}
            aria-label="Close dreamself panel"
          >
            ×
          </button>
        )}
      </div>

      {/* Body */}
      <div className="world-panel-body">
        <div className="dreamself-layout">
          {/* Avatar column */}
          <div className="dreamself-avatar-column">
            <div className="dreamself-avatar-card">
              <AvatarView
                avatar={profile.avatar}
                traits={profile.traits}
                dreamName={profile.dreamName}
              />
            </div>

            <div className="dreamself-archetype-toggle">
              <button
                type="button"
                className="dreamself-archetype-pill dreamself-archetype-pill--active"
              >
                Seer
              </button>
              <button
                type="button"
                className="dreamself-archetype-pill"
                disabled
              >
                Shadow
              </button>
            </div>

            <div className="dreamself-temperament">
              <div className="dreamself-temperament-label">Temperament</div>
              <div className="dreamself-temperament-tags">
                {profile.traits.temperament.join(" · ")}
              </div>
            </div>
          </div>

          {/* Equipment + carried relics */}
          <div className="dreamself-equip-column">
            <div className="dreamself-equip-grid">
              <div className="dreamself-equip-header">Equipment</div>

              <div className="dreamself-equip-row">
                <div className="dreamself-equip-slot">
                  <div className="dreamself-equip-slot-label">Mask</div>
                  <div className="dreamself-equip-slot-field">—</div>
                </div>

                <div className="dreamself-equip-slot">
                  <div className="dreamself-equip-slot-label">Cloak</div>
                  <div className="dreamself-equip-slot-field">—</div>
                </div>
              </div>

              <div className="dreamself-equip-row">
                <div className="dreamself-equip-slot">
                  <div className="dreamself-equip-slot-label">Relic</div>
                  <div className="dreamself-equip-slot-field">—</div>
                </div>

                <div className="dreamself-equip-slot">
                  <div className="dreamself-equip-slot-label">Accessory</div>
                  <div className="dreamself-equip-slot-field">—</div>
                </div>
              </div>
            </div>

            <div className="dreamself-carried">
              <div className="dreamself-carried-header">Carried Relics</div>
              {carriedRelics.length === 0 ? (
                <div className="dreamself-carried-empty">
                  You are not carrying any relics yet.
                </div>
              ) : (
                <ul className="dreamself-carried-list">
                  {carriedRelics.map((item) => (
                    <li
                      key={item.id}
                      className={`dreamself-carried-row dreamself-carried-row--${item.rarity}`}
                    >
                      <span className="dreamself-carried-name">
                        {item.name}
                      </span>
                      <span className="dreamself-carried-rarity">
                        {item.rarity}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
