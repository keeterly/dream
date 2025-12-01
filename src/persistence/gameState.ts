// src/persistence/gameState.ts
import type {
  DreamselfProfile,
  InventoryItem,
  JournalEntry,
} from "../types";

/**
 * Shape of the state we persist to the remote storage.
 * You can evolve this over time – just make sure you handle
 * missing fields gracefully when loading older saves.
 */
export interface SavedGameState {
  profile: DreamselfProfile;
  inventory: InventoryItem[];
  journalEntries: JournalEntry[];
  worldTick: number;

  // NEW: map / overworld state
  currentBiomeId: string;
  currentLocationId: string;
  discoveredLocations: string[];
}
