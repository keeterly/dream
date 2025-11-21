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

  // --- NEW: "loot is on the ground, walking toward it" state ---
  const hasLootSpawned = !!encounterItemName;
  const [hasReachedLoot, setHasReachedLoot] = useState(false);

  // When a new loot spawn happens, start a travel timer that represents
  // the walk-in from offscreen → ribbon center.
  useEffect(() => {
    if (!hasLootSpawned) {
      setHasReachedLoot(false);
      return;
    }

    setHasReachedLoot(false);

    // This should roughly match the CSS loot-approach animation duration.
    const TRAVEL_MS = 5500;
    const id = window.setTimeout(() => {
      setHasReachedLoot(true);
    }, TRAVEL_MS);

    return () => window.clearTimeout(id);
  }, [hasLootSpawned, encounterItemName]);

  // Encounter is only "active" once the avatar has reached the loot.
  const isEncounterActive = !!activeEncounterItem && hasReachedLoot;
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
   * Auto-encounter roll while auto-walk is on.
   * We don't spawn a new item if one is already walking in or active.
   */
  useEffect(() => {
    if (!isAutoWalking || isEncounterActive || hasLootSpawned) return;

    const delay = 8000 + Math.random() * 8000; // 8–16s
    const id = window.setTimeout(() => {
      setWasAutoWalkingBeforeEncounter(true);
      // Let the world keep walking while the loot drifts in; we only
      // flip walking off once the encounter actually becomes active.
      onSpawnDebugItem();
    }, delay);

    return () => window.clearTimeout(id);
  }, [isAutoWalking, isEncounterActive, hasLootSpawned, onSpawnDebugItem]);

  const handleEncounterBannerClick = () => {
    // Tell parent to finalize the encounter (add to inventory, clear active item)
    onResolveEncounter();

    // If we interrupted auto-walk, resume it
    if (wasAutoWalkingBeforeEncounter) {
      setIsAutoWalking(true);
      setWasAutoWalkingBeforeEncounter(false);
    }

    // Clear local reach flag; parent will also clear encounterItemName.
    setHasReachedLoot(false);
  };

  const cardClasses = [
    "world-card",
    lighting.worldClass,
    isEncounterActive ? "world-card--encounter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bannerRarityClass =
    activeEncounterItem != null
      ? `world-encounter-banner--${activeEncounterItem.rarity}`
      : "";

  // Encounter UI (glyph + top banner) is only visible after we've reached loot.
  const showEncounterUI = isEncounterActive;

  return (
    <section className="app-screen app-screen-world">
      <div className={cardClasses}>
        {/* WORLD LANE / PARALLAX BACKGROUND */}
        <WorldLane
          profile={profile}
          environmentId="dusk_valley"
          phase={phase}
          encounterItemName={encounterItemName}
          isEncounterActive={showEncounterUI}
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
            {/* Alert glyph only when the encounter is actually live */}
            {showEncounterUI && <div className="world-encounter-glyph">!</div>}

            <AvatarView
              avatar={profile.avatar}
              traits={profile.traits}
              dreamName={profile.dreamName}
            />

            {/* ground shadow */}
            <div className="world-stage-shadow" />
          </div>
        )}

        {/* GLOBAL TINT OVERLAY */}
        <div className="world-tint-overlay" />

        {/* TOP-CENTER RELIC BANNER */}
        {showEncounterUI && activeEncounterItem && (
          <button
            type="button"
            className={`world-encounter-banner ${bannerRarityClass}`}
            onClick={handleEncounterBannerClick}
          >
            <span className="world-encounter-label">Relic Found</span>
            <span className="world-encounter-name">
              {activeEncounterItem.name}
            </span>
          </button>
        )}

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
                <span className="hud-label">Dreamself</span>
                <span className="hud-value">
                  {profile.traits.primaryArchetype}
                </span>
              </div>
            </div>

            <div className="world-hud-right">
              <div className="world-hud-phase">
                <span className="hud-label">Phase</span>
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

            {activePanel === "character" && (
              <DreamselfPanel profile={profile} inventory={inventory} />
            )}

            {activePanel === "map" && (
              <MapPanel currentBiomeId="dusk_valley" phase={phase} />
            )}

            {activePanel === "journal" && (
              <JournalPanel entries={journalEntries} />
            )}

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
