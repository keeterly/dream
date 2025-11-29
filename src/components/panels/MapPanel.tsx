// src/components/panels/MapPanel.tsx
import React from "react";
import { DUSK_VALLEY_MAP, BiomeMapNode } from "../../maps/duskValleyMap";

interface MapPanelProps {
  currentBiomeId: string;
  phase: string;
}

/**
 * Overworld map panel:
 * - Top: simple “biome track” (current + ??? future biomes)
 * - Below: if current biome is Dusk Valley, show a local node-based map
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

  const showDuskValleyMap = currentBiomeId === "dusk_valley";

  const renderNodeLabel = (node: BiomeMapNode) => {
    if (node.discovery === "hidden") return "???";
    return node.name;
  };

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

      {/* --- Biome track (global overworld view) --- */}
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

      {/* --- Local biome map for Dusk Valley --- */}
      {showDuskValleyMap && (
        <div className="world-map-biome">
          <div className="world-map-biome-header">
            <div className="world-panel-kicker">Current Biome</div>
            <div className="world-panel-title">{DUSK_VALLEY_MAP.name}</div>
            <p className="world-panel-subtitle world-panel-subtitle--tight">
              Routes branch around a buried valley. Known locations glow softly;
              the rest are shapes in the fog.
            </p>
          </div>

          <div className="world-map-biome-canvas">
            {/* Path graph lines */}
            <svg
              className="world-map-biome-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {DUSK_VALLEY_MAP.edges.map((edge) => {
                const from = DUSK_VALLEY_MAP.nodes.find(
                  (n) => n.id === edge.from
                );
                const to = DUSK_VALLEY_MAP.nodes.find(
                  (n) => n.id === edge.to
                );
                if (!from || !to) return null;

                const isHidden =
                  from.discovery === "hidden" && to.discovery === "hidden";

                return (
                  <line
                    key={edge.id}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={
                      "world-map-edge" +
                      (isHidden ? " world-map-edge--hidden" : "")
                    }
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {DUSK_VALLEY_MAP.nodes.map((node) => {
              const isKnown = node.discovery === "known";
              const isReachable = node.discovery === "reachable";

              return (
                <button
                  key={node.id}
                  type="button"
                  className={
                    "world-map-node" +
                    (isKnown ? " world-map-node--known" : "") +
                    (isReachable ? " world-map-node--reachable" : "") +
                    (node.discovery === "hidden"
                      ? " world-map-node--hidden"
                      : "")
                  }
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                  }}
                  // travel interaction will come later — for now nodes are inert
                  disabled={node.discovery === "hidden"}
                >
                  <span className="world-map-node-pin" />
                  <span className="world-map-node-label">
                    {renderNodeLabel(node)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
