import React, { useState } from "react";
import type {
  DreamselfProfile,
  InventoryItem,
  JournalEntry,
} from "../../types";
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

  /** Name of last encounter item – used in HUD if you want */
  encounterItemName: string | null;

  /** Current time-of-day / phase, e.g. "dawn" | "day" | "dusk" | "night" */
  phase: string;

  /** When set, we show the “Relic found” bubble + pause walking */
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

  // Clicking the same button closes its panel; clicking another switches.
  const togglePanel = (panel: WorldPanelId) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const dominantElement = profile?.traits?.dominantElement ?? null;

  const lighting = useBiomeLighting({
    phase,
    element: dominantElement,
  });

  return (
    <section className="app-screen app-screen-world">
      <div className={`world-card ${lighting.worldClass}`}>
        {/* WORLD LANE BACKGROUND / PARALLAX */}
        <WorldLane
          profile={profile}
          environmentId="dusk_valley"
          phase={phase}
          encounterItemName={encounterItemName}
          isEncounterActive={isEncounterActive}
        />

        {/* DREAMSELF AVATAR WALKING THE RIBBON */}
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
              <>
                {/* Attention glyph above head */}
                <div className="world-encounter-glyph">!</div>

                {/* Speech-bubble style text */}
                <div className="world-encounter-bubble">
                  <div className="world-encounter-label">Relic found</div>
                  <div className="world-encounter-name">
                    {activeEncounterItem.name}
                  </div>
                </div>
              </>
            )}

            {/* Ground shadow always attached to avatar */}
            <div className="world-stage-shadow" />
          </div>
        )}

        {/* GLOBAL TINT OVERLAY (phase / element mood) */}
        <div className="world-tint-overlay" />

        {/* HUD + DOCK + PANELS */}
        <div className="world-overlay">
          {/* HUD */}
          <div className="world-hud">
            <div className="world-hud-left">
              <div className="world-hud-field">
                <span className="hud-kicker">FIELD — SCROLLING WORLD</span>
              </div>
              <div className="world-hud-title-row">
                <span className="world-hud-title">
                  {profile?.dreamName ?? "Dreamself"}
                </span>
                <span className="world-hud-pill">LV 01</span>
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
            {/* INVENTORY */}
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

            {/* DREAMSELF */}
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

            {/* MAP */}
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

            {/* JOURNAL */}
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

            {/* DEBUG */}
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
            {/* INVENTORY PANEL */}
            {activePanel === "inventory" && (
              <div className="world-panel world-panel-inventory">
                <div className="world-panel-header">
                  <span className="world-panel-kicker">Relics</span>
                  <span className="world-panel-title">Bound Objects</span>
                </div>

                {inventory.length === 0 ? (
                  <p className="world-panel-empty">
                    Walk further. Relics tend to find you once they know your
                    shape.
                  </p>
                ) : (
                  <ul className="inventory-list">
                    {inventory.map((item) => (
                      <li
                        key={item.id}
                        className={`inventory-item inventory-item--${item.rarity}`}
                      >
                        <div className="inventory-item-icon" />
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

            {/* DREAMSELF PANEL */}
            {activePanel === "character" && (
              <DreamselfPanel profile={profile} inventory={inventory} />
            )}

            {/* MAP PANEL */}
            {activePanel === "map" && (
              <MapPanel currentBiomeId="dusk_valley" phase={phase} />
            )}

            {/* JOURNAL PANEL */}
            {activePanel === "journal" && (
              <JournalPanel entries={journalEntries} />
            )}

            {/* DEBUG PANEL */}
            {activePanel === "debug" && (
              <div className="world-panel world-panel-debug">
                <div className="world-panel-header">
                  <span className="world-panel-kicker">Debug</span>
                  <span className="world-panel-title">Relic Testing</span>
                </div>
                <p className="world-panel-copy">
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
