import React from "react";
import type { DreamselfProfile, InventoryItem } from "../../types";
import { AvatarView } from "../AvatarView";

interface DreamselfPanelProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
}

/**
 * RPG-style character sheet:
 * - Big avatar on the left
 * - Equipment slots on the right (visual skeleton for now)
 */
export const DreamselfPanel: React.FC<DreamselfPanelProps> = ({
  profile,
  inventory,
}) => {
  const traits = profile.traits;

  return (
    <div className="world-panel world-panel-dreamself">
      <div className="dreamself-layout">
        <div className="dreamself-avatar-column">
          <div className="dreamself-avatar-card">
            <AvatarView
              avatar={profile.avatar}
              traits={profile.traits}
              dreamName={profile.dreamName}
            />
          </div>
          <div className="dreamself-tags">
            <span className="dreamself-tag">
              {traits.primaryArchetype.toUpperCase()}
            </span>
            {traits.dominantElement && (
              <span className="dreamself-tag">
                {traits.dominantElement.toUpperCase()}
              </span>
            )}
          </div>
          <p className="dreamself-temperament">
            Temperament:{" "}
            {traits.temperamentTags && traits.temperamentTags.join(" · ")}
          </p>
        </div>

        <div className="dreamself-equip-column">
          <h3 className="world-panel-title">Equipment</h3>
          <div className="dreamself-slot-grid">
            <div className="dreamself-slot">
              <div className="dreamself-slot-label">Mask</div>
              <div className="dreamself-slot-body dreamself-slot-body--empty">
                —
              </div>
            </div>
            <div className="dreamself-slot">
              <div className="dreamself-slot-label">Cloak</div>
              <div className="dreamself-slot-body dreamself-slot-body--empty">
                —
              </div>
            </div>
            <div className="dreamself-slot">
              <div className="dreamself-slot-label">Relic</div>
              <div className="dreamself-slot-body dreamself-slot-body--empty">
                —
              </div>
            </div>
            <div className="dreamself-slot">
              <div className="dreamself-slot-label">Accessory</div>
              <div className="dreamself-slot-body dreamself-slot-body--empty">
                —
              </div>
            </div>
          </div>

          <div className="dreamself-inventory-preview">
            <h4 className="dreamself-inventory-title">Carried Relics</h4>
            {inventory.length === 0 ? (
              <p className="dreamself-inventory-empty">
                No relics yet. The world is still learning your outline.
              </p>
            ) : (
              <ul className="dreamself-inventory-list">
                {inventory.map((item) => (
                  <li
                    key={item.id + item.acquiredAt}
                    className={`dreamself-inventory-item rarity-${item.rarity}`}
                  >
                    <span className="dreamself-inventory-name">
                      {item.name}
                    </span>
                    <span className="dreamself-inventory-rarity">
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
  );
};
