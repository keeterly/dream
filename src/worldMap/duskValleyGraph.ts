// src/worldMap/duskValleyGraph.ts

export const DUSK_VALLEY_GRAPH: Record<string, string[]> = {
  cave_of_departure: ["riverbreak_path"],
  riverbreak_path: ["cave_of_departure", "valley_campfire"],
  valley_campfire: ["riverbreak_path", "shard_overlook", "sunken_plaza"],
  shard_overlook: ["valley_campfire", "murmuring_faults"], // ??? node
  sunken_plaza: ["valley_campfire", "murmuring_faults"],
  murmuring_faults: ["shard_overlook", "sunken_plaza"], // end-of-road for now
};
