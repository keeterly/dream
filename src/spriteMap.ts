// src/spriteMap.ts
// Canonical mapping from *display name* → SVG filename in /public/items/foundItems

const SPRITE_BY_NAME: Record<string, string> = {
  "Glass Relic": "glass_relic.svg",
  "Short Chunky Crystal": "short_chunky_crystal.svg",
  "Split Crystal": "split_crystal.svg",
  "Faceted Diamond": "faceted_diamond.svg",
  "Low Gem Prison": "low_gem_prison.svg",
  "Rough-cut Stone": "rough_cut_stone.svg",
};

// Fallback: if we ever get an unknown name, just show Glass Relic.
export function getSpriteForItemName(name: string): string {
  return SPRITE_BY_NAME[name] ?? "glass_relic.svg";
}
