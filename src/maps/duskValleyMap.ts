// src/maps/duskValleyMap.ts

export type MapNodeKind = "route" | "camp" | "ruin" | "city" | "landmark";

export type MapNodeDiscovery = "known" | "reachable" | "hidden";

export interface BiomeMapNode {
  id: string;
  name: string;
  kind: MapNodeKind;
  discovery: MapNodeDiscovery;
  x: number; // 0–100, % of width
  y: number; // 0–100, % of height
}

export interface BiomeMapEdge {
  id: string;
  from: string;
  to: string;
}

export interface BiomeMap {
  id: string;
  name: string;
  nodes: BiomeMapNode[];
  edges: BiomeMapEdge[];
}

/**
 * First-pass “FFTactics-style” overworld for Dusk Valley.
 * - Left side: cave / entry
 * - Mid: split at the campfire
 * - Right: two branches + a ??? at the far end
 */
export const DUSK_VALLEY_MAP: BiomeMap = {
  id: "dusk_valley",
  name: "Dusk Valley Ruins",
  nodes: [
    {
      id: "cave_entry",
      name: "Cave of Departure",
      kind: "ruin",
      discovery: "known",
      x: 12,
      y: 58,
    },
    {
      id: "river_path",
      name: "Riverbreak Path",
      kind: "route",
      discovery: "known",
      x: 30,
      y: 52,
    },
    {
      id: "campfire",
      name: "Valley Campfire",
      kind: "camp",
      discovery: "known",
      x: 45,
      y: 48,
    },
    {
      id: "overlook",
      name: "Shard Overlook",
      kind: "landmark",
      discovery: "reachable",
      x: 63,
      y: 38,
    },
    {
      id: "sunken_plaza",
      name: "Sunken Plaza",
      kind: "ruin",
      discovery: "reachable",
      x: 66,
      y: 63,
    },
    {
      id: "valley_gate",
      name: "???",
      kind: "city",
      discovery: "hidden",
      x: 82,
      y: 50,
    },
  ],
  edges: [
    { id: "cave_to_river", from: "cave_entry", to: "river_path" },
    { id: "river_to_camp", from: "river_path", to: "campfire" },
    { id: "camp_to_overlook", from: "campfire", to: "overlook" },
    { id: "camp_to_plaza", from: "campfire", to: "sunken_plaza" },
    { id: "overlook_to_gate", from: "overlook", to: "valley_gate" },
    { id: "plaza_to_gate", from: "sunken_plaza", to: "valley_gate" },
  ],
};
