// src/worldItemsByLocation.ts

import type { WorldItem } from "./types";
import { WORLD_ITEMS } from "./worldItems";

/**
 * Per-location loot tables for Dusk Valley.
 * For now each location just uses the global WORLD_ITEMS pool.
 * You can specialize each node later.
 */
export const LOCATION_ITEM_TABLES: Record<string, WorldItem[]> = {
  cave_of_departure: WORLD_ITEMS,
  riverbreak_path: WORLD_ITEMS,
  valley_campfire: WORLD_ITEMS,
  shard_overlook: WORLD_ITEMS,
  sunken_plaza: WORLD_ITEMS,
  murmuring_faults: WORLD_ITEMS,
};

/**
 * Helper: safely get the loot table for a location,
 * falling back to WORLD_ITEMS if we don't have an entry.
 */
export function getItemTableForLocation(locationId: string): WorldItem[] {
  return LOCATION_ITEM_TABLES[locationId] ?? WORLD_ITEMS;
}
