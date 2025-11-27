// src/persistence/remoteStorage.ts
import type { SavedGameState } from "./gameState";

// Use a fixed slot id for now – later you can support multiple saves.
const DEFAULT_SLOT_ID = "slot-1";

const API_BASE = "/api"; // or "https://your-backend.com" etc.

export async function saveGameOnline(state: SavedGameState): Promise<void> {
  const res = await fetch(`${API_BASE}/save-game`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slotId: DEFAULT_SLOT_ID,
      state,
    }),
  });

  if (!res.ok) {
    // optional: surface something in UI instead of console
    // but at least don't crash the game
    console.error("Failed to save game", await res.text());
  }
}

export async function loadGameOnline(): Promise<SavedGameState | null> {
  const res = await fetch(
    `${API_BASE}/load-game?slotId=${encodeURIComponent(DEFAULT_SLOT_ID)}`,
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    console.error("Failed to load game", await res.text());
    return null;
  }

  const data = await res.json();
  // expecting { state: SavedGameState | null }
  return (data && data.state) || null;
}
