// src/worldItemsByLocation.ts
import { WORLD_ITEMS } from "./worldItems";
import type { InventoryItemBase } from "./types"; // whatever base type you use for WORLD_ITEMS

// quick helper to filter by tag or rarity if you have them
const byTag = (tag: string): InventoryItemBase[] =>
  WORLD_ITEMS.filter((item) => item.tags?.includes(tag));

export const LOCATION_ITEM_TABLES: Record<string, InventoryItemBase[]> = {
  cave_of_departure: byTag("origin"),
  riverbreak_path: byTag("path") ?? WORLD_ITEMS,
  valley_campfire: byTag("camp") ?? WORLD_ITEMS,
  shard_overlook: byTag("shard"),
  sunken_plaza: byTag("water"),
  murmuring_faults: byTag("deep"),
};
