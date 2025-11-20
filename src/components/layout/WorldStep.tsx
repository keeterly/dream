import React, { useEffect, useState } from "react";
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
  encounterItemName: string | null;
  phase: string;
  activeEncounterItem: InventoryItem | null;
  /** Clear the current encounter (and usually add to inventory) */
  onResolveEncounter: () => void;
}

export const WorldStep: React.FC<WorldStepProps> = ({
  profile,
  inventory,
  journalEntries,
  onSpawnDebugItem,
  encounterItemName,
  phase,
  activeEncounterItem,
  onResolveEncounter,
}) => {
  const [activePanel, setActivePanel] = useState<WorldPanelId | null>(
    "inventory"
  );

  // Auto-walk toggle for HUD
  const [isAutoWalking, setIsAutoWalking] = useState(true);
  // Did we start the encounter while auto-walk was on?
  const [wasAutoWalkingBeforeEncounter, setWasAutoWalkingBeforeEncounter] =
    useState(false);

  const isEncounterActive = !!activeEncounterItem;
  const isWalking = isAutoWalking && !isEncounterActive;

  const togglePanel = (panel: WorldPanelId) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const dominantElement = profile?.traits?.dominantElement ?? null;
  const lighting = useBiomeLighting({
    phase,
    element: dominantElement,
  });

  /**
   * If an encounter becomes active while auto-walk is enabled,
   * pause walking and remember that we should resume afterwards.
   */
  useEffect(() => {
    if (isEncounterActive && isAutoWalking) {
      setWasAutoWalkingBeforeEncounter(true);
      setIsAutoWalking(false);
    }

    if (!isEncounterActive) {
      // When all encounters are cleared we reset the flag.
      setWasAutoWalkingBeforeEncounter(false);
    }
  }, [isEncounterActive, isAutoWalking]);

  /**
   * Auto-encounter roll:
   * While auto-walk is ON and nothing is happening,
   * roll for a relic encounter every 8–16 seconds.
   *
   * For now this just reuses onSpawnDebugItem, which should
   * create a new activeEncounterItem in the parent.
   */
  useEffect(() => {
    if (!isAutoWalking || isEncounterActive) return;

    const delay = 8000 + Math.random() * 8000; // 8–16s
    const id = window.setTimeout(() => {
      setWasAutoWalkingBeforeEncounter(true);
      setIsAutoWalking(false);
      onSpawnDebugItem();
    }, delay);

    return () => window.clearTimeout(id);
  }, [isAutoWalking, isEncounterActive, onSpawnDebugItem]);

  const handleEncounterBannerClick = () => {
    // Tell parent to finalize the encounter (add to inventory, clear active item)
    onResolveEncounter();

    // If we interrupted auto-walk, resume it
    if (wasAutoWalkingBeforeEncounter) {
      setIsAutoWalking(true);
      setWasAutoWalkingBeforeEncounter(false);
    }
  };

  return (
    <section className="app-screen app-screen-world">
      <div className={`world-card ${lighting.worldClass}`}>
        {/* WORLD LANE / PARALLAX */}
        <WorldLane
          profile={profile}
          environmentId="dusk_valley"
          phase={phase}
          encounterItemName={encounterItemName}
          isEncounterActive={isEncounterActive}
          isWalking={isWalking}
        />

        {/* DREAMSELF AVATAR ON THE RIBBON */}
        {profile && (
          <div
            className={`world-stage-avatar ${
              isWalking
                ? "world-stage-avatar--walking"
                : "world-stage-avatar--paused"
            } ${lighting.avatarClass}`}
          >
            <AvatarView
              avatar={profile.avatar}
              traits={profile.traits}
              dreamName={profile.dreamName}
            />

            {/* Encounter indicator above head */}
            {activeEncounterItem && (
              <>
                <div className="world-encounter-glyph">!</div>

                <button
                  type="button"
                  className="world-encounter-banner world-encounter-banner--visible"
                  onClick={handleEncounterBannerClick}
                >
                  <div className="world-encounter-banner-label">
                    Relic Found
                  </div>
                  <div className="world-encounter-banner-name">
                    {activeEncounterItem.name}
                  </div>
                  <div className="world-encounter-banner-orb" />
                </button>
              </>
            )}

            {/* ground shadow */}
            <div className="world-stage-shadow" />
          </div>
        )}

        {/* GLOBAL TINT OVERLAY */}
        <div className="world-tint-overlay" />

        {/* OVERLAY: HUD + DOCK + PANELS */}
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

              {/* Auto-walk toggle */}
              <button
                type="button"
                className={`world-autowalk-toggle ${
                  isWalking
                    ? "world-autowalk-toggle--on"
                    : "world-autowalk-toggle--off"
                }`}
                onClick={() => setIsAutoWalking((prev) => !prev)}
                disabled={isEncounterActive}
              >
                <span className="world-autowalk-label">Auto-walk</span>
                <span className="world-autowalk-state">
                  {isWalking ? "ON" : "OFF"}
                </span>
                <span className="world-autowalk-dot" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* DOCK BUTTONS */}
          <div className="world-dock">
            {/* Inventory */}
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

            {/* Dreamself */}
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

            {/* Map */}
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

            {/* Journal */}
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

            {/* Debug */}
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
            {/* Inventory panel */}
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

            {/* Dreamself panel */}
            {activePanel === "character" && (
              <DreamselfPanel profile={profile} inventory={inventory} />
            )}

            {/* Map panel */}
            {activePanel === "map" && (
              <MapPanel currentBiomeId="dusk_valley" phase={phase} />
            )}

            {/* Journal panel */}
            {activePanel === "journal" && (
              <JournalPanel entries={journalEntries} />
            )}

            {/* Debug panel */}
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
