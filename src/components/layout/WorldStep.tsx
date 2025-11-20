import React, { useState } from "react";
import type { DreamselfProfile, InventoryItem, JournalEntry } from "../../types";
import WorldLane from "../WorldLane";
import { JournalPanel } from "../panels/JournalPanel";
import { AvatarView } from "../AvatarView";
import { useBiomeLighting } from "../../hooks/useBiomeLighting";
import { DreamselfPanel } from "../panels/DreamselfPanel";
import { MapPanel } from "../panels/MapPanel";

type WorldPanelId = "inventory" | "character" | "map" | "journal" | "debug";

interface WorldStepProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  journalEntries: JournalEntry[];
  onSpawnDebugItem: () => void;
  encounterItemName: string | null;
  phase: string;
  activeEncounterItem?: InventoryItem | null;
}

export const WorldStep: React.FC<WorldStepProps> = ({
  profile,
  inventory,
  journalEntries,
  onSpawnDebugItem,
  encounterItemName,
  phase,
  activeEncounterItem,
}) => {
  const isEncounterActive = !!activeEncounterItem;

  const [activePanel, setActivePanel] =
    useState<WorldPanelId | null>("inventory");

  // helper: clicking a button toggles the panel open/closed
  const togglePanel = (panel: WorldPanelId) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const dominantElement = profile?.traits?.dominantElement ?? null;

  const lighting = useBiomeLighting({
    phase,
    element: dominantElement,
  });

  return (
    <section className="app-screen app-screen-world">
      <div className={`world-card ${lighting.worldClass}`}>
        {/* WORLD LANE */}
        <WorldLane
          profile={profile}
          environmentId="dusk_valley"
          phase={phase}
          encounterItemName={encounterItemName}
        />

        {/* DREAMSELF AVATAR ON RIBBON */}
        {profile && (
          <div
            className={`world-stage-avatar ${
              isEncounterActive
                ? "world-stage-avatar--paused"
                : "world-stage-avatar--walking"
            } ${lighting.avatarClass}`}
          >
            <AvatarView
              avatar={profile.avatar}
              traits={profile.traits}
              dreamName={profile.dreamName}
            />

            {activeEncounterItem && (
              <div className="world-encounter-bubble">
                <div className="world-encounter-label">Relic found</div>
                <div className="world-encounter-name">
                  {activeEncounterItem.name}
                </div>
              </div>
            )}
          </div>
        )}

        {/* GLOBAL TINT OVERLAY */}
        <div className="world-tint-overlay" />

        {/* WORLD OVERLAY (HUD, DOCK, PANELS) */}
        <div className="world-overlay">
          {/* HUD */}
          <div className="world-hud">
            <div className="world-hud-left">
              <div className="world-hud-field">
                <span className="hud-kicker">FIELD — SCROLLING WORLD</span>
              </div>
              <div className="world-hud-title-row">
                <span className="world-hud-title">{profile.dreamName}</span>
                <span className="world-hud-badge">LV 01</span>
              </div>
              <div className="world-hud-meta">
                <span className="hud-label">DREAMSELF</span>
                <span className="hud-value">
                  {profile.traits.primaryArchetype}
                </span>
              </div>
            </div>

            <div className="world-hud-right">
              <div className="world-hud-phase">
                <span className="hud-label">PHASE</span>
                <span className="hud-value">{phase}</span>
              </div>
            </div>
          </div>

          {/* DOCK BUTTONS */}
          <div className="world-dock">
            <button
              className={
                "world-dock-button" +
                (activePanel === "inventory" ? " world-dock-button--active" : "")
              }
              onClick={() => togglePanel("inventory")}
            >
              <span className="world-dock-icon world-dock-icon--inventory" />
              <span className="world-dock-label">Inventory</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "character" ? " world-dock-button--active" : "")
              }
              onClick={() => togglePanel("character")}
            >
              <span className="world-dock-icon world-dock-icon--dreamself" />
              <span className="world-dock-label">Dreamself</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "map" ? " world-dock-button--active" : "")
              }
              onClick={() => togglePanel("map")}
            >
              <span className="world-dock-icon world-dock-icon--map" />
              <span className="world-dock-label">Map</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "journal" ? " world-dock-button--active" : "")
              }
              onClick={() => togglePanel("journal")}
            >
              <span className="world-dock-icon world-dock-icon--journal" />
              <span className="world-dock-label">Journal</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "debug" ? " world-dock-button--active" : "")
              }
              onClick={() => togglePanel("debug")}
            >
              <span className="world-dock-icon world-dock-icon--debug" />
              <span className="world-dock-label">Debug</span>
            </button>
          </div>

          {/* PANELS */}
          <div className="world-panels">
            {activePanel === "journal" && (
              <JournalPanel entries={journalEntries} />
            )}

            {activePanel === "inventory" && (
              <div className="world-panel world-panel-inventory">
                <h3 className="world-panel-title">Relics</h3>
                {inventory.length === 0 ? (
                  <p className="world-panel-empty">
                    Walk further. Relics tend to find you once they know your
                    shape.
                  </p>
                ) : (
                  <ul className="inventory-list">
                    {inventory.map((item) => (
                      <li
                        key={item.id + item.acquiredAt}
                        className={`inventory-item rarity-${item.rarity}`}
                      >
                        <div className="inventory-item-icon-wrapper">
                          <span
                            className={`inventory-item-icon rarity-${item.rarity}`}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="inventory-item-content">
                          <div className="inventory-item-main">
                            <span className="inventory-item-name">
                              {item.name}
                            </span>
                            <span className="inventory-item-rarity">
                              {item.rarity}
                            </span>
                          </div>
                          <p className="inventory-item-desc">
                            {item.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activePanel === "character" && (
              <DreamselfPanel profile={profile} inventory={inventory} />
            )}

            {activePanel === "map" && (
              <MapPanel currentBiomeId="dusk_valley" phase={phase} />
            )}

            {activePanel === "debug" && (
              <div className="world-panel world-panel-debug">
                <h3 className="world-panel-title">Debug</h3>
                <p className="world-panel-body">
                  Spawn a random relic event for testing drops and journal
                  entries.
                </p>
                <button
                  type="button"
                  className="world-debug-pill"
                  onClick={onSpawnDebugItem}
                >
                  <span className="world-debug-pill__orb" />
                  <span className="world-debug-pill__label">
                    Spawn Random Relic
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
