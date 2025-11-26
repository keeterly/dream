// src/components/panels/DreamselfPanel.tsx
import React from "react";
import type { DreamselfProfile, InventoryItem } from "../../types";
import { AvatarView } from "../AvatarView";

interface DreamselfPanelProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  onClose: () => void;
}

/**
 * Dreamself / equipment panel.
 * Layout mirrors the inventory modal:
 * - Large framed panel with close in the top-right
 * - Avatar card on the left
 * - Equipment slots + carried relics list on the right
 */
export const DreamselfPanel: React.FC<DreamselfPanelProps> = ({
  profile,
  inventory,
  onClose,
}) => {
  const carriedRelics = inventory;

  return (
    <div className="world-panel world-panel--full">
      <div className="world-panel-frame">
        {/* Header */}
        <div className="world-panel-header">
          <div>
            <div className="world-panel-kicker">Dreamself</div>
            <div className="world-panel-title">Equipment</div>
          </div>
        </div>

        <div className="dreamself-layout">
          {/* LEFT: Avatar column */}
          <div className="dreamself-avatar-column">
            <div className="dreamself-avatar-card">
              <AvatarView
                avatar={profile.avatar}
                traits={profile.traits}
                dreamName={profile.dreamName}
              />
            </div>

            <div className="dreamself-mode-toggle">
              <button
                type="button"
                className="dreamself-mode-pill dreamself-mode-pill--active"
              >
                Seer
              </button>
              <button type="button" className="dreamself-mode-pill">
                Shadow
              </button>
            </div>

            <div className="dreamself-temperament">
              <div className="dreamself-temperament-line">
                <span className="dreamself-temperament-label">
                  Primary archetype:
                </span>
                <span className="dreamself-temperament-value">
                  {profile.traits.primaryArchetype}
                </span>
              </div>
              <div className="dreamself-temperament-line">
                <span className="dreamself-temperament-label">
                  Dominant element:
                </span>
                <span className="dreamself-temperament-value">
                  {profile.traits.dominantElement ?? "—"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Equipment + carried relics */}
          <div className="dreamself-equipment-column">
            <div className="dreamself-equipment-grid">
              <div className="dreamself-equipment-row">
                <div className="dreamself-equipment-slot">
                  <div className="dreamself-equipment-label">Mask</div>
                  <div className="dreamself-equipment-value">—</div>
                </div>
                <div className="dreamself-equipment-slot">
                  <div className="dreamself-equipment-label">Cloak</div>
                  <div className="dreamself-equipment-value">—</div>
                </div>
              </div>

              <div className="dreamself-equipment-row">
                <div className="dreamself-equipment-slot">
                  <div className="dreamself-equipment-label">Relic</div>
                  <div className="dreamself-equipment-value">—</div>
                </div>
                <div className="dreamself-equipment-slot">
                  <div className="dreamself-equipment-label">Accessory</div>
                  <div className="dreamself-equipment-value">—</div>
                </div>
              </div>
            </div>

            <div className="dreamself-relics">
              <div className="dreamself-relics-header">
                <span className="dreamself-relics-title">Carried Relics</span>
              </div>

              {carriedRelics.length === 0 ? (
                <div className="dreamself-relics-empty">
                  You are not carrying any relics yet.
                </div>
              ) : (
                <ul className="dreamself-relics-list">
                  {carriedRelics.map((item) => (
                    <li key={item.id} className="dreamself-relics-row">
                      <span className="dreamself-relics-name">{item.name}</span>
                      <span className="dreamself-relics-rarity">
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
