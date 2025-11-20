import React, { useState } from "react";
import type { DreamselfProfile, InventoryItem, JournalEntry } from "../../types";
import { WorldLane } from "../../WorldLane";
import { JournalPanel } from "../panels/JournalPanel";
// (Optional: InventoryPanel, CharacterPanel, MapPanel, DebugPanel later)

type WorldPanelId = "inventory" | "character" | "map" | "journal" | "debug";

interface WorldStepProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  journalEntries: JournalEntry[];
  onSpawnDebugItem: () => void;
}

export const WorldStep: React.FC<WorldStepProps> = ({
  profile,
  inventory,
  journalEntries,
  onSpawnDebugItem,
}) => {
  const [activePanel, setActivePanel] = useState<WorldPanelId | null>("inventory");

  return (
    <section className="app-screen app-screen-world">
      <div className="world-card">
        <WorldLane environmentId="dusk_valley" phase="twilight" />

        <div className="world-overlay">
          {/* HUD */}
          <div className="world-hud">
            <div className="world-hud-left">
              <span className="world-hud-label">Dreamself</span>
              <span className="world-hud-value">{profile.dreamName}</span>
            </div>
            <div className="world-hud-right">
              <span className="world-hud-pill">
                {profile.traits.primaryArchetype} ·{" "}
                {profile.traits.primaryElement}
              </span>
            </div>
          </div>

          {/* Dock */}
          <div className="world-dock">
            <button
              className={
                "world-dock-button" +
                (activePanel === "inventory" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("inventory")}
            >
              Inventory
            </button>
            <button
              className={
                "world-dock-button" +
                (activePanel === "character" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("character")}
            >
              Dreamself
            </button>
            <button
              className={
                "world-dock-button" +
                (activePanel === "map" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("map")}
            >
              Map
            </button>
            <button
              className={
                "world-dock-button" +
                (activePanel === "journal" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("journal")}
            >
              Journal
            </button>
            <button
              className={
                "world-dock-button" +
                (activePanel === "debug" ? " world-dock-button--active" : "")
              }
              onClick={() => setActivePanel("debug")}
            >
              Debug
            </button>
          </div>

          {/* Panels */}
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
                        key={item.id + item.acquiredAtIso}
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
                <button
                  className="secondary-button"
                  onClick={onSpawnDebugItem}
                >
                  Spawn Random Relic
                </button>
              </div>
            )}

            {/* TODO: Character & Map panels can be extracted from your existing code */}
          </div>
        </div>
      </div>
    </section>
  );
};
