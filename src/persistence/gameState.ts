// src/persistence/gameState.ts
import type { DreamselfProfile, InventoryItem, JournalEntry } from "../types";

export type SavedGameState = {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  journalEntries: JournalEntry[];
  worldTick: number;
  // add more later if you need (phase overrides, settings, etc.)
};
