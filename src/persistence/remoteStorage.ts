// src/persistence/remoteStorage.ts
import type { SavedGameState } from "./gameState";

const DEFAULT_SLOT_ID = "slot-1";
const API_BASE = "/api";
const LOCAL_KEY = `dream-save-${DEFAULT_SLOT_ID}`;

function saveToLocal(state: SavedGameState) {
  if (typeof window === "undefined") return;
  try {
    const payload = { state, savedAt: new Date().toISOString() };
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to write local save", err);
  }
}

function loadFromLocal(): SavedGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // handle both { state } and raw SavedGameState
    return (parsed && parsed.state) || parsed || null;
  } catch (err) {
    console.error("Failed to read local save", err);
    return null;
  }
}

export async function saveGameOnline(state: SavedGameState): Promise<void> {
  // Always keep a local backup
  saveToLocal(state);

  // Best-effort remote save (safe to fail)
  try {
    const res = await fetch(`${API_BASE}/save-game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: DEFAULT_SLOT_ID,
        state,
      }),
    });

    if (!res.ok) {
      console.error("Failed to save game (remote)", await res.text());
    }
  } catch (err) {
    console.error("Failed to save game (network error)", err);
  }
}

export async function loadGameOnline(): Promise<SavedGameState | null> {
  // 1) Try local first – this makes everything work even without a backend
  const local = loadFromLocal();
  if (local) return local;

  // 2) If there’s a backend later, try that as well
  try {
    const res = await fetch(
      `${API_BASE}/load-game?slotId=${encodeURIComponent(DEFAULT_SLOT_ID)}`,
      { method: "GET" }
    );

    if (!res.ok) {
      console.error("Failed to load game (remote)", await res.text());
      return null;
    }

    const data = await res.json();
    const remoteState: SavedGameState | null =
      (data && data.state) || null;

   // option: cache remote save locally too
    if (remoteState) saveToLocal(remoteState);

    return remoteState;
  } catch (err) {
    console.error("Failed to load game (network error)", err);
    return null;
  }
}
