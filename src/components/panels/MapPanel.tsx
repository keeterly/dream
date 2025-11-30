// src/components/panels/MapPanel.tsx
import React from "react";

interface MapPanelProps {
  currentBiomeId: string;
  phase: string;

  /** Optional – where the player is within the current biome */
  currentLocationId?: string;

  /** Optional – which locations in this biome have been discovered */
  discoveredLocations?: string[];

  /** Called when the player clicks a known location on the map */
  onSelectLocation?: (locationId: string) => void;
}


type BiomeNodeType = "path" | "camp" | "overlook" | "hub" | "unknown";

interface BiomeNode {
  id: string;
  label: string;
  x: number; // 0–100 as percentage across the card
  y: number; // 0–100 as percentage down the card
  type: BiomeNodeType;
}

/**
 * Static layout for Dusk Valley Ruins.
 * Once you have real progression, you can move this into data files.
 */
const DUSK_VALLEY_NODES: BiomeNode[] = [
  {
    id: "cave_departure",
    label: "Cave of Departure",
    x: 13,
    y: 70,
    type: "hub",
  },
  {
    id: "riverbreak_path",
    label: "Riverbreak Path",
    x: 32,
    y: 58,
    type: "path",
  },
  {
    id: "valley_campfire",
    label: "Valley Campfire",
    x: 48,
    y: 70,
    type: "camp",
  },
  {
    id: "shard_overlook",
    label: "Shard Overlook",
    x: 64,
    y: 40,
    type: "overlook",
  },
  {
    id: "sunken_plaza",
    label: "Sunken Plaza",
    x: 64,
    y: 73,
    type: "hub",
  },
  {
    id: "distant_ruin",
    label: "???",
    x: 82,
    y: 52,
    type: "unknown",
  },
];

const OVERWORLD_BIOMES = [
  { id: "dusk_valley", label: "Dusk Valley Ruins" },
  { id: "nocturnal_ridge", label: "???" },
  { id: "shore_morning", label: "???" },
  { id: "future_city", label: "???" },
];

export const MapPanel: React.FC<MapPanelProps> = ({
  currentBiomeId,
  phase,
  currentLocationId,
  discoveredLocations,
  onSelectLocation, // NEW
}) => {
  // --- Overworld strip ------------------------------------------------------

  const overworldBiomes = OVERWORLD_BIOMES;

  // --- Current biome: Dusk Valley Ruins -------------------------------------

  const isInDuskValley = currentBiomeId === "dusk_valley";

  // Default demo state: most nodes known, last one hidden behind fog.
  const defaultDiscovered = [
    "cave_departure",
    "riverbreak_path",
    "valley_campfire",
    "shard_overlook",
    "sunken_plaza",
    // "distant_ruin" intentionally omitted → stays as ???
  ];

  const discoveredSet = new Set(
    discoveredLocations && discoveredLocations.length > 0
      ? discoveredLocations
      : defaultDiscovered
  );

  const effectiveCurrentLocationId =
    currentLocationId ?? "valley_campfire"; // starting hub for now

  return (
    <div className="world-panel world-panel-map">
      {/* OVERWORLD STRIP */}
      <div className="world-panel-header">
        <div className="world-panel-header-left">
          <div className="world-panel-kicker">Map</div>
          <div className="world-panel-title">Overworld</div>
        </div>
      </div>

      <p className="world-panel-subtitle">
        You walk a ribbon between worlds. Current phase:{" "}
        <strong>{phase}</strong>
      </p>

      <div className="map-track">
        {overworldBiomes.map((biome, index) => {
          const isActive = biome.id === currentBiomeId;
          return (
            <div
              key={biome.id}
              className={
                "map-node" +
                (isActive ? " map-node--active" : "") +
                (index === 0 ? " map-node--first" : "") +
                (index === overworldBiomes.length - 1
                  ? " map-node--last"
                  : "")
              }
            >
              <div className="map-node-pin" />
              <div className="map-node-label">{biome.label}</div>
            </div>
          );
        })}
      </div>

      {/* CURRENT BIOME CARD */}
      {isInDuskValley && (
        <section className="map-current-biome">
          <header className="map-current-biome-header">
            <div className="map-current-biome-kicker">Current Biome</div>
            <div className="map-current-biome-title">Dusk Valley Ruins</div>
            <p className="map-current-biome-copy">
              Routes branch around a buried valley. Known locations glow softly;
              the rest are shapes in the fog.
            </p>
          </header>

          <div className="map-biome-card">
            <div className="map-biome-canvas">
              <div className="map-biome-route" />

              {DUSK_VALLEY_NODES.map((node) => {
                const isDiscovered =
                  node.type !== "unknown" && discoveredSet.has(node.id);
                const isCurrent = node.id === effectiveCurrentLocationId;

                const label = isDiscovered ? node.label : "???";

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={
                      "map-biome-node" +
                      (isDiscovered ? " map-biome-node--known" : "") +
                      (!isDiscovered ? " map-biome-node--hidden" : "") +
                      (node.type === "camp" ? " map-biome-node--camp" : "") +
                      (node.type === "hub" ? " map-biome-node--hub" : "") +
                      (node.type === "overlook"
                        ? " map-biome-node--overlook"
                        : "") +
                      (isCurrent ? " map-biome-node--current" : "")
                    }
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                    }}
                    disabled={!isDiscovered || !onSelectLocation}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!onSelectLocation || !isDiscovered) return;
                      onSelectLocation(node.id);
                    }}
                  >
                    <span className="map-biome-node-pin" />
                    <span className="map-biome-node-label">{label}</span>
                  </button>

                );
              })}
            </div>

            <div className="map-biome-footer">
              <div className="map-biome-chevron" aria-hidden="true" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
