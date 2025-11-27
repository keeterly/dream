import React from "react";

interface MapPanelProps {
  currentBiomeId: string;
  phase: string;
}

/**
 * Lightweight overworld map:
 * - Highlights the current biome
 * - Shows a few unknown nodes as "???"
 * You can swap this out later for something more elaborate.
 */
export const MapPanel: React.FC<MapPanelProps> = ({
  currentBiomeId,
  phase,
}) => {
  const biomes = [
    { id: "dusk_valley", label: "Dusk Valley Ruins" },
    { id: "nocturnal_ridge", label: "???" },
    { id: "shore_morning", label: "???" },
    { id: "future_city", label: "???" },
  ];

  return (
    <div className="world-panel world-panel-map">
      <div className="world-panel-header">
        <div>
          <div className="world-panel-kicker">Map</div>
          <div className="world-panel-title">Overworld</div>
        </div>
      </div>

      <p className="world-panel-subtitle">
        You walk a ribbon between worlds. Current phase:{" "}
        <strong>{phase}</strong>
      </p>

      <div className="map-track">
        {biomes.map((biome, index) => {
          const isActive = biome.id === currentBiomeId;
          return (
            <div
              key={biome.id}
              className={
                "map-node" +
                (isActive ? " map-node--active" : "") +
                (index === 0 ? " map-node--first" : "") +
                (index === biomes.length - 1 ? " map-node--last" : "")
              }
            >
              <div className="map-node-pin" />
              <div className="map-node-label">{biome.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
