// server/src/model.ts

// Keep in sync with src/persistence/gameState.ts
export interface SavedGameState {
  profile: any;
  inventory: any[];
  journalEntries: any[];
  worldTick: number;

  currentBiomeId: string;
  currentLocationId: string;
  discoveredLocations: string[];
}

export interface SaveSlotRecord {
  playerId: string;
  slotId: string;
  state: SavedGameState;
  savedAt: string; // ISO timestamp
}

export interface SaveDatabase {
  // key = `${playerId}:${slotId}`
  [key: string]: SaveSlotRecord;
}

export function makeDbKey(playerId: string, slotId: string): string {
  return `${playerId}:${slotId}`;
}
