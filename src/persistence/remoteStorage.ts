// src/persistence/remoteStorage.ts
import type { SavedGameState } from "./gameState";

const DEFAULT_SLOT_ID = "slot-1";
// In dev, Vite proxy will forward "/api" to your backend.
// In production you can set VITE_API_BASE to your deployed server URL.
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE && (import.meta as any).env.VITE_API_BASE !== ""
    ? (import.meta as any).env.VITE_API_BASE
    : "";

// ---- Player identity --------------------------------------------------

// For now we use an anonymous per-browser playerId so multiple browsers
// count as separate "players". Later you can swap this to real auth.
const PLAYER_ID_KEY = "dream-player-id";

function getPlayerId(): string {
  if (typeof window === "undefined") return "anonymous";

  let id = window.localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    // simple random id for now
    id = `anon-${crypto.randomUUID()}`;
    window.localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

// ---- Remote Save / Load -----------------------------------------------

export async function saveGameOnline(state: SavedGameState): Promise<void> {
  const playerId = getPlayerId();

  try {
    const res = await fetch(`${API_BASE}/api/save-game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: DEFAULT_SLOT_ID,
        playerId,
        state,
      }),
    });

    if (!res.ok) {
      console.error("Failed to save game (remote)", await res.text());
    }
  } catch (err) {
    console.error("Failed to save game (network)", err);
  }
}

export async function loadGameOnline(): Promise<SavedGameState | null> {
  const playerId = getPlayerId();

  try {
    const res = await fetch(
      `${API_BASE}/api/load-game?slotId=${encodeURIComponent(
        DEFAULT_SLOT_ID
      )}&playerId=${encodeURIComponent(playerId)}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      console.error("Failed to load game (remote)", await res.text());
      return null;
    }

    const data = await res.json();
    // expect { ok: true, state: SavedGameState | null, ... }
    return (data && data.state) || null;
  } catch (err) {
    console.error("Failed to load game (network)", err);
    return null;
  }
}
