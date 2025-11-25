// src/components/layout/WorldStep.tsx
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

type WorldPanelId = "character" | "map" | "journal" | "debug";

interface WorldStepProps {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  journalEntries: JournalEntry[];
  onSpawnDebugItem: () => void;
  encounterItemName: string | null;
  phase: string;
  activeEncounterItem: InventoryItem | null;
  /** Clear the current encounter + add to inventory in parent */
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
  const [activePanel, setActivePanel] = useState<WorldPanelId | null>(null);

  // Timing constants (ms)
  const LOOT_TRAVEL_MS = 5500; // walk-in from offscreen
  const LOOT_PICKUP_ANIM_MS = 450; // MUST match CSS pickup duration
  const AUTO_PICKUP_DELAY_MS = 250; // delay before auto pickup (Relic Found visible)
  const INVENTORY_TOAST_MS = 1600; // "+1 Relic" toast lifetime

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryToastItem, setInventoryToastItem] =
    useState<InventoryItem | null>(null);

  // Number of relics picked up since the last time the inventory was opened
  const [inventoryUnreadCount, setInventoryUnreadCount] = useState(0);

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

  // "Walking" = auto-walk ON and not currently paused for a manual pickup.
  const isWalking = isAutoWalking && !(!isAutoPickup && isEncounterActive);

  const togglePanel = (panel: WorldPanelId) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const dominantElement = profile?.traits?.dominantElement ?? null;
  const lighting = useBiomeLighting({
    phase,
    element: dominantElement,
  });

  const DockButton: React.FC<{
    label: string;
    icon: string;
    active?: boolean;
    notification?: number;
    onClick: () => void;
  }> = ({ label, icon, active = false, notification = 0, onClick }) => {
    return (
      <button
        type="button"
        className={
          "world-dock-btn" + (active ? " world-dock-btn--active" : "")
        }
        onClick={onClick}
      >
        <div className="world-dock-icon-wrap">
          <span className={`world-dock-icon world-dock-icon--${icon}`} />
          {notification > 0 && (
            <span className="world-dock-notification">
              {notification > 99 ? "99+" : notification}
            </span>
          )}
        </div>
        <div className="world-dock-label">{label}</div>
      </button>
    );
  };

  /**
   * If an encounter becomes active while auto-walk is enabled
   * AND auto-pickup is OFF, pause walking and remember that we
   * should resume afterward.
   */
  useEffect(() => {
    if (isEncounterActive && isAutoWalking && !isAutoPickup) {
      setWasAutoWalkingBeforeEncounter(true);
      setIsAutoWalking(false);
    }

    if (!isEncounterActive) {
      // When encounters clear, reset the flag.
      setWasAutoWalkingBeforeEncounter(false);
    }
  }, [isEncounterActive, isAutoWalking, isAutoPickup]);

  /**
   * Auto-encounter roll while actually walking.
   * We don't spawn a new item if one is already walking in or active.
   */
  useEffect(() => {
    if (!isWalking || isEncounterActive || hasLootSpawned) return;

    // 5–10 seconds between potential drops while walking
    const delay = 5000 + Math.random() * 5000;
    const id = window.setTimeout(() => {
      setWasAutoWalkingBeforeEncounter(true);
      onSpawnDebugItem();
    }, delay);

    return () => window.clearTimeout(id);
  }, [isWalking, isEncounterActive, hasLootSpawned, onSpawnDebugItem]);

  /**
   * Player clicks the "Relic Found" banner.
   * This is the *only* place the parent adds the relic to inventory.
   */
  const handleEncounterBannerClick = () => {
    if (!isEncounterActive || !activeEncounterItem) return;

    // Local state → play pickup animation on the lane
    setIsLootCollected(true);

    const shouldResumeAutoWalk = wasAutoWalkingBeforeEncounter;
    const itemForToast = activeEncounterItem;

    // Parent actually adds the relic to inventory here
    onResolveEncounter();

    // Increment unread counter for the inventory badge
    setInventoryUnreadCount((prev) => prev + 1);

    // Toast: show "+1 Relic" immediately
    if (itemForToast) {
      setInventoryToastItem(itemForToast);
      window.setTimeout(() => {
        setInventoryToastItem(null);
      }, INVENTORY_TOAST_MS);
    }

    // After the lane pickup animation, clean up local state
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
   * trigger the same flow as clicking the banner after a short delay.
   */
  useEffect(() => {
    if (!isAutoPickup) return;
    if (!isEncounterActive) return;
    if (isLootCollected) return;
    if (!activeEncounterItem) return;

    const id = window.setTimeout(() => {
      handleEncounterBannerClick();
    }, AUTO_PICKUP_DELAY_MS);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoPickup, isEncounterActive, isLootCollected, activeEncounterItem]);

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

  // Inventory dock click: open modal + clear notification
  const handleInventoryDockClick = () => {
    setIsInventoryModalOpen(true);
    setInventoryUnreadCount(0);
  };

  // When closing the modal, just flip the flag (counter already cleared)
  const handleCloseInventoryModal = () => {
    setIsInventoryModalOpen(false);
  };

  // Close any of the non-inventory modal panels
  const handleCloseActivePanel = () => {
    setActivePanel(null);
  };

  // Helper to label the modal based on active panel
  const getActivePanelTitle = (): string => {
    switch (activePanel) {
      case "character":
        return "Dreamself";
      case "map":
        return "Map";
      case "journal":
        return "Journal";
      case "debug":
        return "Debug";
      default:
        return "";
    }
  };

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

          {/* Bottom-left HP / MP / Stamina bars */}
          <div className="world-hud-bars">
            <div className="world-hud-bar world-hud-bar--hp">
              <span className="world-hud-bar-label">HP</span>
              <div className="world-hud-bar-track">
                <div
                  className="world-hud-bar-fill"
                  style={{ width: "76%" }}
                />
              </div>
            </div>

            <div className="world-hud-bar world-hud-bar--mp">
              <span className="world-hud-bar-label">MP</span>
              <div className="world-hud-bar-track">
                <div
                  className="world-hud-bar-fill"
                  style={{ width: "54%" }}
                />
              </div>
            </div>

            <div className="world-hud-bar world-hud-bar--stamina">
              <span className="world-hud-bar-label">STAMINA</span>
              <div className="world-hud-bar-track">
                <div
                  className="world-hud-bar-fill"
                  style={{ width: "88%" }}
                />
              </div>
            </div>
          </div>

          {/* DOCK BUTTONS */}
          <div className="world-dock">
            <DockButton
              label="Inventory"
              icon="inventory"
              active={isInventoryModalOpen}
              notification={inventoryUnreadCount}
              onClick={handleInventoryDockClick}
            />

            <DockButton
              label="Dreamself"
              icon="dreamself"
              active={activePanel === "character"}
              onClick={() => togglePanel("character")}
            />

            <DockButton
              label="Map"
              icon="map"
              active={activePanel === "map"}
              onClick={() => togglePanel("map")}
            />

            <DockButton
              label="Journal"
              icon="journal"
              active={activePanel === "journal"}
              notification={journalEntries.length > 0 ? 1 : 0}
              onClick={() => togglePanel("journal")}
            />

            <DockButton
              label="Debug"
              icon="debug"
              active={activePanel === "debug"}
              onClick={() => togglePanel("debug")}
            />
          </div>

          {/* +1 RELIC TOAST NEAR INVENTORY DOCK */}
          {inventoryToastItem && (
            <div className="world-inventory-toast">
              <div className="world-inventory-toast-pill">+1 Relic</div>
              <div className="world-inventory-toast-name">
                {inventoryToastItem.name}
              </div>
            </div>
          )}

          {/* === MODAL PANELS (Dreamself / Map / Journal / Debug) ======= */}
          {activePanel && (
            <div
              className="world-panel-modal-backdrop"
              onClick={handleCloseActivePanel}
            >
              <div
                className="world-panel-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="world-panel-modal-close"
                  aria-label="Close panel"
                  onClick={handleCloseActivePanel}
                >
                  ×
                </button>
                {/* Optional: title strip above the embedded panel */}
                <div className="world-panel-modal-header">
                  <span className="world-panel-modal-title">
                    {getActivePanelTitle()}
                  </span>
                </div>

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
          )}
        </div>
      </div>

      {/* INVENTORY GRID MODAL */}
      <InventoryGridModal
        items={inventory}
        isOpen={isInventoryModalOpen}
        onClose={handleCloseInventoryModal}
      />
    </section>
  );
};
