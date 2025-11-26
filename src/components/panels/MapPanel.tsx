import React from "react";

interface MapPanelProps {
  currentBiomeId: string;
  phase: string;
  onClose?: () => void;
}

const BIOMES = [
  { id: "dusk_valley", label: "Dusk Valley Ruins" },
  { id: "node_2", label: "???" },
  { id: "node_3", label: "???" },
  { id: "node_4", label: "???" },
];

export const MapPanel: React.FC<MapPanelProps> = ({
  currentBiomeId,
  phase,
  onClose,
}) => {
  return (
    <section className="world-panel world-panel-map">
      <header className="world-panel-header">
        <div className="world-panel-header-main">
          <div className="world-panel-kicker">Map</div>
          <h2 className="world-panel-title">World Map</h2>
        </div>

        {onClose && (
          <button
            type="button"
            className="world-panel-modal-close"
            onClick={onClose}
            aria-label="Close map"
          >
            ×
          </button>
        )}
      </header>

      <div className="world-panel-body">
        <p className="map-intro">
          You walk a ribbon between worlds. Current phase:{" "}
          <span className="map-phase">{phase}</span>
        </p>

        <div className="map-track">
          {BIOMES.map((biome, index) => {
            const isActive = biome.id === currentBiomeId;
            const isLast = index === BIOMES.length - 1;

            return (
              <div
                key={biome.id}
                className={
                  "map-node" +
                  (isActive ? " map-node--active" : "") +
                  (isLast ? " map-node--last" : "")
                }
              >
                <div className="map-node-pin" />
                <div className="map-node-label">{biome.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
