import React from "react";
import type { DreamselfProfile, InventoryItem } from "../../types";

interface DreamselfPanelProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  onClose?: () => void;
}

export const DreamselfPanel: React.FC<DreamselfPanelProps> = ({
  profile,
  inventory,
  onClose,
}) => {
  const handleClose = () => {
    if (onClose) onClose();
  };

  const carriedRelics = inventory;

  return (
    <section className="world-panel world-panel-dreamself">
      {/* HEADER */}
      <header
        className="world-panel-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div className="world-panel-kicker">Dreamself</div>
          <div className="world-panel-title">
            {profile.dreamName || "Dreamself"}
          </div>
        </div>

        <button
          type="button"
          className="world-panel-modal-close"
          onClick={handleClose}
          aria-label="Close dreamself panel"
        >
          ×
        </button>
      </header>

      {/* BODY */}
      <div className="dreamself-layout">
        {/* Avatar column */}
        <div className="dreamself-avatar-column">
          <div className="dreamself-avatar-card">
            <img
              src={profile.avatar.imageUrl}
              alt={profile.dreamName}
              className="dreamself-avatar-image"
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
              className="dreamself-archetype-pill dreamself-archetype-pill--inactive"
            >
              Shadow
            </button>
          </div>

          {profile.traits && (
            <p className="dreamself-temperament">
              Primary archetype: {profile.traits.primaryArchetype}.
            </p>
          )}
        </div>

        {/* Equipment + relics column */}
        <div className="dreamself-info-column">
          <section className="dreamself-equipment">
            <h3 className="dreamself-section-title">Equipment</h3>

            <div className="dreamself-equipment-grid">
              <div className="dreamself-equipment-slot">
                <div className="dreamself-equipment-label">Mask</div>
                <div className="dreamself-equipment-value">—</div>
              </div>
              <div className="dreamself-equipment-slot">
                <div className="dreamself-equipment-label">Cloak</div>
                <div className="dreamself-equipment-value">—</div>
              </div>
              <div className="dreamself-equipment-slot">
                <div className="dreamself-equipment-label">Relic</div>
                <div className="dreamself-equipment-value">—</div>
              </div>
              <div className="dreamself-equipment-slot">
                <div className="dreamself-equipment-label">Accessory</div>
                <div className="dreamself-equipment-value">—</div>
              </div>
            </div>
          </section>

          <section className="dreamself-relics">
            <h3 className="dreamself-section-title">Carried Relics</h3>

            <ul className="dreamself-relic-list">
              {carriedRelics.map((item) => (
                <li key={item.id} className="dreamself-relic-row">
                  <span className="dreamself-relic-name">{item.name}</span>
                  <span className={`dreamself-relic-rarity rarity-${item.rarity}`}>
                    {item.rarity}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
};
