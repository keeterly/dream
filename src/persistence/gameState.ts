// src/persistence/gameState.ts

import type {
  DreamselfProfile,
  InventoryItem,
  JournalEntry,
} from "../types";

export type BiomeId = "dusk_valley"; // later: | "ashen_city" | ...

export interface SavedGameState {
  /** Schema version so you can migrate old saves later */
  version: number;

  /** Character & archetype */
  profile: DreamselfProfile;

  /** Carried relics / items */
  inventory: InventoryItem[];

  /** Journal entries (can be server-enriched later) */
  journalEntries: JournalEntry[];

  /** Global world tick when this was saved */
  worldTick: number;

  /** Where in the overworld the player is */
  currentBiomeId: BiomeId;
  currentLocationId: string;
  discoveredLocations: string[];

  /** Optional extra fields as you grow */
  // currencies?: { aether: number; shards: number };
  // flags?: Record<string, boolean>;
}
