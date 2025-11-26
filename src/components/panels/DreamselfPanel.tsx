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
  const { avatar, traits, dreamName } = profile;

  return (
    <section className="world-panel world-panel-dreamself">
      <header className="world-panel-header">
        <div className="world-panel-header-main">
          <div className="world-panel-kicker">Dreamself</div>
          <h2 className="world-panel-title">{dreamName}</h2>
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
      </header>

      <div className="world-panel-body dreamself-layout">
        {/* Portrait / avatar card */}
        <section className="dreamself-portrait-card">
          <div className="dreamself-portrait">
            {/* You can swap this for your AvatarView if desired */}
            <div className="dreamself-figure">
              <div className="dreamself-head" />
              <div className="dreamself-body" />
            </div>
          </div>

          <div className="dreamself-role-pill-row">
            <span className="dreamself-role-pill">{traits.primaryArchetype}</span>
            {traits.shadowArchetype && (
              <span className="dreamself-role-pill dreamself-role-pill--sub">
                {traits.shadowArchetype}
              </span>
            )}
          </div>

          {traits.temperament && traits.temperament.length > 0 && (
            <p className="dreamself-temperament">
              Temperament:{" "}
              <span className="dreamself-temperament-values">
                {traits.temperament.join(" · ")}
              </span>
            </p>
          )}
        </section>

        {/* Equipment + carried relics */}
        <section className="dreamself-stats-card">
          <div className="dreamself-equipment-header">
            <h3 className="dreamself-section-title">Equipment</h3>
          </div>

          <div className="dreamself-equipment-grid">
            <div className="dreamself-equipment-slot">
              <div className="dreamself-equipment-label">Mask</div>
              <div className="dreamself-equipment-empty">—</div>
            </div>
            <div className="dreamself-equipment-slot">
              <div className="dreamself-equipment-label">Cloak</div>
              <div className="dreamself-equipment-empty">—</div>
            </div>
            <div className="dreamself-equipment-slot">
              <div className="dreamself-equipment-label">Relic</div>
              <div className="dreamself-equipment-empty">—</div>
            </div>
            <div className="dreamself-equipment-slot">
              <div className="dreamself-equipment-label">Accessory</div>
              <div className="dreamself-equipment-empty">—</div>
            </div>
          </div>

          <div className="dreamself-relics-section">
            <h3 className="dreamself-section-title">Carried Relics</h3>
            {inventory.length === 0 ? (
              <p className="dreamself-empty-relics">
                You’re not holding any relics yet.
              </p>
            ) : (
              <ul className="dreamself-relic-list">
                {inventory.map((item) => (
                  <li key={item.id} className="dreamself-relic-row">
                    <span className="dreamself-relic-name">{item.name}</span>
                    <span
                      className={`dreamself-relic-rarity dreamself-relic-rarity--${item.rarity}`}
                    >
                      {item.rarity}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};
