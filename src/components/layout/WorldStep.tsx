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
import { InventoryGridModal } from "../InventoryGridModal";

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
  // Panels still exist for character/map/journal/debug, but inventory is handled by modal
  const [activePanel, setActivePanel] = useState<WorldPanelId | null>(null);

  // Timings (must match CSS where noted)
  const LOOT_TRAVEL_MS = 5500; // walk-in from offscreen
  const LOOT_PICKUP_ANIM_MS = 450; // MUST match CSS pickup duration
  const AUTO_PICKUP_DELAY_MS = 250; // how long Relic Found shows before pickup
  const INVENTORY_TOAST_MS = 1600; // how long "+1 Relic" stays visible
  const INVENTORY_CAPACITY = 30;

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryToastItem, setInventoryToastItem] =
    useState<InventoryItem | null>(null);

  // Auto-walk & auto-pickup toggles for HUD
  const [isAutoWalking, setIsAutoWalking] = useState(true);
  const [isAutoPickup, setIsAutoPickup] = useState(true);

  // Did we start the encounter while auto-walk was on?
  const [wasAutoWalkingBeforeEncounter, setWasAutoWalkingBeforeEncounter] =
    useState(false);

  // --- Loot lifecycle state ---
  const hasLootSpawned = !!encounterItemName;
  const [hasReachedLoot, setHasReachedLoot] = useState(false);
  const [isLootCollected, setIsLootCollected] = useState(false);

  const isInventoryFull = inventory.length >= INVENTORY_CAPACITY;

  // New spawn → simulate walk-in time from off-screen to the avatar
  useEffect(() => {
    if (!hasLootSpawned) {
      setHasReachedLoot(false);
      setIsLootCollected(false);
      return;
    }

    setHasReachedLoot(false);
    setIsLootCollected(false);

    const id = window.setTimeout(() => {
      setHasReachedLoot(true);
    }, LOOT_TRAVEL_MS);

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
   * BUT: if auto-pickup is on, let the Dreamself keep walking.
   */
  useEffect(() => {
    if (isEncounterActive && isAutoWalking && !isAutoPickup) {
      setWasAutoWalkingBeforeEncounter(true);
      setIsAutoWalking(false);
    }

    if (!isEncounterActive) {
      // When all encounters are cleared we reset the flag.
      setWasAutoWalkingBeforeEncounter(false);
    }
  }, [isEncounterActive, isAutoWalking, isAutoPickup]);

  /**
   * Auto-encounter roll while auto-walk is on.
   * We don't spawn a new item if one is already walking in or active.
   * Also: if inventory is full, no more random relics will spawn.
   */
  useEffect(() => {
    if (!isAutoWalking || isEncounterActive || hasLootSpawned) return;
    if (isInventoryFull) return;

    const delay = 8000 + Math.random() * 8000; // 8–16s
    const id = window.setTimeout(() => {
      setWasAutoWalkingBeforeEncounter(true);
      onSpawnDebugItem();
    }, delay);

    return () => window.clearTimeout(id);
  }, [
    isAutoWalking,
    isEncounterActive,
    hasLootSpawned,
    isInventoryFull,
    onSpawnDebugItem,
  ]);

const handleEncounterBannerClick = () => {
  if (!isEncounterActive || !activeEncounterItem) return;

  // Start local pickup state so WorldLane can play its collect animation
  setIsLootCollected(true);

  // Snapshot flags + item for toast
  const shouldResumeAutoWalk = wasAutoWalkingBeforeEncounter;
  const itemForToast = activeEncounterItem;

  // ✅ 1) Immediately add to inventory / clear encounter in parent
  onResolveEncounter();

  // ✅ 2) Show "+1 Relic" toast right away
  if (itemForToast) {
    setInventoryToastItem(itemForToast);
    window.setTimeout(() => {
      setInventoryToastItem(null);
    }, INVENTORY_TOAST_MS);
  }

  // ✅ 3) After the sprite animation finishes, clean up local state
  window.setTimeout(() => {
    if (shouldResumeAutoWalk) {
      setIsAutoWalking(true);
    }
    setHasReachedLoot(false);
    setIsLootCollected(false);
  }, LOOT_PICKUP_ANIM_MS);
};


  /**
   * Auto-pickup: when an encounter becomes active and auto-pickup is ON,
   * trigger the same flow as clicking the banner. The Dreamself can keep
   * walking if auto-walk is still enabled.
   */
  useEffect(() => {
    // Only run if auto-pickup is enabled
    if (!isAutoPickup) return;
    // Only when the encounter is actually live (avatar has reached loot)
    if (!isEncounterActive) return;
    // Don't retrigger once we've started pickup
    if (isLootCollected) return;
    // Need a real item
    if (!activeEncounterItem) return;
    // If inventory is full, skip auto-pick attempts
    if (isInventoryFull) return;

    // Wait a moment so the player sees "Relic Found" + !,
    // then behave exactly like a manual banner click.
    const id = window.setTimeout(() => {
      handleEncounterBannerClick();
    }, AUTO_PICKUP_DELAY_MS);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAutoPickup,
    isEncounterActive,
    isLootCollected,
    activeEncounterItem,
    isInventoryFull,
  ]);

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

  // Encounter UI (glyph + top banner) hides once we've clicked / auto-picked
  const showEncounterUI = isEncounterActive && !isLootCollected;

  return (
    <>
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
            isLootCollected={isLootCollected}
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
              {showEncounterUI && (
                <div className="world-encounter-glyph">!</div>
              )}

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
                {isInventoryFull && (
                  <div className="world-hud-warning">
                    Inventory full — no new relics will spawn.
                  </div>
                )}
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
                  disabled={isEncounterActive && !isAutoPickup}
                >
                  <span className="world-autowalk-label">Auto-walk</span>
                  <span className="world-autowalk-state">
                    {isWalking ? "ON" : "OFF"}
                  </span>
                  <span className="world-autowalk-dot" aria-hidden="true" />
                </button>

                {/* Auto-pickup toggle */}
                <button
                  type="button"
                  className={`world-autowalk-toggle ${
                    isAutoPickup
                      ? "world-autowalk-toggle--on"
                      : "world-autowalk-toggle--off"
                  }`}
                  onClick={() => setIsAutoPickup((prev) => !prev)}
                >
                  <span className="world-autowalk-label">Auto-pickup</span>
                  <span className="world-autowalk-state">
                    {isAutoPickup ? "ON" : "OFF"}
                  </span>
                  <span className="world-autowalk-dot" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* DOCK BUTTONS */}
            <div className="world-dock">
              {/* INVENTORY now only opens the modal */}
              <button
                className={
                  "world-dock-button" +
                  (isInventoryModalOpen ? " world-dock-button--active" : "")
                }
                onClick={() => setIsInventoryModalOpen(true)}
              >
                <span className="world-dock-icon world-dock-icon--inventory" />
                <span className="world-dock-label">Inventory</span>
              </button>

              <button
                className={
                  "world-dock-button" +
                  (activePanel === "character"
                    ? " world-dock-button--active"
                    : "")
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
                  (activePanel === "journal"
                    ? " world-dock-button--active"
                    : "")
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

            {/* +1 RELIC TOAST NEAR INVENTORY DOCK */}
            {inventoryToastItem && (
              <div className="world-inventory-toast">
                <div className="world-inventory-toast-pill">
                  {isInventoryFull ? "Inventory Full" : "+1 Relic"}
                </div>
                <div className="world-inventory-toast-name">
                  {inventoryToastItem.name}
                </div>
              </div>
            )}

            {/* PANELS – inventory panel removed; only other panels remain */}
            <div className="world-panels">
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

      {/* INVENTORY GRID MODAL */}
      <InventoryGridModal
        items={inventory}
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
      />
    </>
  );
};
