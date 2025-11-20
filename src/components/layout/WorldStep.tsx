import React, { useEffect, useState } from "react";
import { useDreamContext } from "../../state/DreamContext";
import AvatarView from "../avatar/AvatarView";
import { getRandomRelic } from "../../systems/encounters";
import type { Relic } from "../../types";

import "./WorldStep.css"; // keep background in CSS


export default function WorldStep() {
  const { profile, addRelicToJournal, addRelicToInventory } = useDreamContext();

  const [offset, setOffset] = useState(0);
  const [walking, setWalking] = useState(true);
  const [foundRelic, setFoundRelic] = useState<Relic | null>(null);
  const [showBubble, setShowBubble] = useState(false);

  // === Ribbon movement (Right → Left)
  useEffect(() => {
    if (!walking) return;
    const t = setInterval(() => {
      setOffset((prev) => (prev - 0.4) % 2000); // smooth scroll
    }, 16);
    return () => clearInterval(t);
  }, [walking]);

  // === Trigger a test relic encounter
  function forceSpawnRelic() {
    const relic = getRandomRelic();

    // stop movement
    setWalking(false);
    setFoundRelic(relic);

    // update inventory & journal
    addRelicToInventory(relic);
    addRelicToJournal(relic);

    // show popup
    setShowBubble(true);

    // dismiss
    setTimeout(() => {
      setShowBubble(false);
      setWalking(true);
    }, 1800);
  }

  return (
    <div className="worldstep-container">
      {/* BACKGROUND FIXED — lives fully in CSS */}
      <div
        className="world-ribbon"
        style={{ transform: `translateX(${offset}px)` }}
      />

      <div className="world-character">
        <AvatarView avatar={profile.avatar} scale={1.8} walking={walking} />

        {/* === Floating bubble === */}
        {showBubble && foundRelic && (
          <div className="found-popup">
            <div>RELIC FOUND</div>
            <div className="found-name">{foundRelic.name}</div>
          </div>
        )}
      </div>

      {/* === Bottom buttons === */}
      <div className="world-ui">
        <button className="ui-btn">Inventory</button>
        <button className="ui-btn">Dreamself</button>
        <button className="ui-btn">Map</button>
        <button className="ui-btn">Journal</button>

        {/* DEBUG BUTTON */}
        <button className="ui-btn debug" onClick={forceSpawnRelic}>
          Spawn Random Relic
        </button>
      </div>
    </div>
  );
}
