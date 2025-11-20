import React, { useState } from "react";
import type { DreamselfProfile, InventoryItem, JournalEntry } from "../../types";
import WorldLane from "../WorldLane";
import { JournalPanel } from "../panels/JournalPanel";
import { AvatarView } from "../AvatarView";

type WorldPanelId = "inventory" | "character" | "map" | "journal" | "debug";

interface WorldStepProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  journalEntries: JournalEntry[];
  onSpawnDebugItem: () => void;
  encounterItemName: string | null;
  phase: string;
}

export const WorldStep: React.FC<WorldStepProps> = ({
  profile,
  inventory,
  journalEntries,
  onSpawnDebugItem,
  encounterItemName,
  phase,
}) => {
  const [activePanel, setActivePanel] =
    useState<WorldPanelId | null>("inventory");

  return (
    <section className="app-screen app-screen-world">
      <div className="world-card">
        {/* WORLD LANE */}
        <WorldLane
          profile={profile}
          environmentId="dusk_valley"
          phase={phase}
          encounterItemName={encounterItemName}
        />

        {/* DREAMSELF AVATAR OVERLAY */}
        {profile && (
            <div
  className={`world-stage-avatar world-stage-avatar--walking world-phase-${phase}`}
>


            <AvatarView
              avatar={profile.avatar}
              traits={profile.traits}
              dreamName={profile.dreamName}
            />
          </div>
        )}

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

          {/* DOCK */}
          <div className="world-dock">
            <button
              className={
                "world-dock-button" +
                (activePanel === "inventory" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("inventory")}
            >
              <span className="world-dock-icon world-dock-icon--inventory" />
              <span className="world-dock-label">Inventory</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "character" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("character")}
            >
              <span className="world-dock-icon world-dock-icon--dreamself" />
              <span className="world-dock-label">Dreamself</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "map" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("map")}
            >
              <span className="world-dock-icon world-dock-icon--map" />
              <span className="world-dock-label">Map</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "journal"
                  ? " world-dock-button--active"
                  : "")
              }
              onClick={() => setActivePanel("journal")}
            >
              <span className="world-dock-icon world-dock-icon--journal" />
              <span className="world-dock-label">Journal</span>
            </button>

            <button
              className={
                "world-dock-button" +
                (activePanel === "debug" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("debug")}
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
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activePanel === "debug" && (
              <div className="world-panel world-panel-debug">
                <h3 className="world-panel-title">Debug</h3>
                <p className="world-panel-body">
                  Spawn a random relic event for testing drops and journal
                  entries.
                </p>
                <button className="secondary-button" onClick={onSpawnDebugItem}>
                  Spawn Random Relic
                </button>
              </div>
            )}

            {/* character + map can be wired next */}
          </div>
        </div>
      </div>
    </section>
  );
};
