// --- W O R L D   S T E P   ( fixed version ) ---

import React, { useEffect, useState, useRef } from "react";
import { useDreamContext } from "../../state/DreamContext";
import AvatarView from "../avatar/AvatarView";
import { getRandomRelic } from "../../system/encounters";
import { Relic } from "../../types";

export default function WorldStep() {
  const { profile, inventory, addRelicToInventory, journal, addJournalEntry } =
    useDreamContext();

  const [isWalking, setIsWalking] = useState(true);
  const [encounter, setEncounter] = useState<Relic | null>(null);

  const [phase, setPhase] = useState<"dawn" | "day" | "dusk" | "night">("dawn");

  // Bubble timing
  const encounterTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- TRIGGER RANDOM ENCOUNTER ---
  const triggerEncounter = (forced?: boolean) => {
    if (!isWalking && !forced) return;

    const relic = getRandomRelic();

    setEncounter(relic);
    setIsWalking(false);

    addRelicToInventory(relic);
    addJournalEntry({
      type: "relic",
      title: `Found relic: ${relic.name}`,
      body: relic.description,
    });

    if (encounterTimeout.current) clearTimeout(encounterTimeout.current);

    encounterTimeout.current = setTimeout(() => {
      setEncounter(null);
      setIsWalking(true);
    }, 2400);
  };

  // Interval-based random find
  useEffect(() => {
    if (!isWalking) return;

    const timer = setInterval(() => {
      const chance = Math.random();
      if (chance < 0.035) triggerEncounter();
    }, 2200);

    return () => clearInterval(timer);
  }, [isWalking]);

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
      if (encounterTimeout.current) clearTimeout(encounterTimeout.current);
    };
  }, []);

  return (
    <div className="world-card">
      {/* -------------------------------
          SCROLLING BACKGROUND LAYERS
      --------------------------------*/}
      <div className={`world-lane world-lane--phase-${phase} ${!isWalking ? "world-lane--paused" : ""}`}>
        {/* sky */}
        <div className="world-lane-sky" />
        <div className="world-lane-stars" />

        {/* parallax hills */}
        <div className="world-lane-backdrop world-lane-backdrop--far" />
        <div className="world-lane-backdrop world-lane-backdrop--near" />

        {/* scrolling ground */}
        <div className="world-lane-ground world-lane-ground--back" />
        <div className="world-lane-ground world-lane-ground--front" />
      </div>

      {/* -------------------------------
          WORLD STAGE (AVATAR)
      --------------------------------*/}
      <div className="world-stage">
        <div
          className={`world-stage-avatar ${
            isWalking ? "world-stage-avatar--walking" : "world-stage-avatar--paused"
          } world-phase-${phase}`}
        >
          <AvatarView profile={profile} size="world" />
        </div>

        {/* Floating loot crystal if encounter occurs */}
        {encounter && <div className="world-lane-crystal" />}
      </div>

      {/* -------------------------------
          OVERLAY (HUD + DOCK)
      --------------------------------*/}
      <div className="world-overlay">
        {/* HUD */}
        <div className="world-hud">
          <div className="world-hud-left">
            <div className="hud-kicker">Field — Scrolling World</div>
            <div className="world-hud-title-row">
              <div className="world-hud-title">{profile?.dreamName}</div>
              <div className="world-hud-badge">Lv 01</div>
            </div>
            <div className="world-hud-meta">
              <span className="hud-label">Dreamself</span>
              <span className="hud-value">{profile?.traits.primaryArchetype}</span>
            </div>
          </div>

          <div className="world-hud-right">
            <div className="world-hud-phase-label">Phase</div>
            <div className="world-hud-phase-value">{phase.toUpperCase()}</div>
          </div>
        </div>

        {/* DOCK BUTTONS */}
        <div className="world-dock">
          <button className="world-dock-button">
            <span className="world-dock-icon world-dock-icon--inventory"></span>
            <span className="world-dock-label">Inventory</span>
          </button>

          <button className="world-dock-button">
            <span className="world-dock-icon world-dock-icon--dreamself"></span>
            <span className="world-dock-label">Dreamself</span>
          </button>

          <button className="world-dock-button">
            <span className="world-dock-icon world-dock-icon--map"></span>
            <span className="world-dock-label">Map</span>
          </button>

          <button className="world-dock-button world-dock-button--active">
            <span className="world-dock-icon world-dock-icon--debug"></span>
            <span className="world-dock-label">Debug</span>
          </button>
        </div>

        {/* PANELS (inventory/journal/etc.) */}
        <div className="world-panels">
          {/* Debug Panel Example */}
          <div className="world-panel">
            <div className="world-panel-title">Debug</div>

            <button
              className="world-debug-pill"
              onClick={() => triggerEncounter(true)}
            >
              <div className="world-debug-pill__orb" />
              <span className="world-debug-pill__label">Spawn Random Relic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Encounter Bubble */}
      {encounter && (
        <>
          <div className="world-encounter-glyph">!</div>
          <div className="world-encounter-bubble">
            <span className="world-encounter-label">Relic Found</span>
            <span className="world-encounter-name">{encounter.name}</span>
          </div>
        </>
      )}
    </div>
  );
}
