import React from "react";

interface MapPanelProps {
  currentBiomeId: string;
  phase: string;
  onClose?: () => void;
}

const biomes: { id: string; label: string }[] = [
  { id: "dusk_valley", label: "Dusk Valley Ruins" },
  { id: "biome_2", label: "???" },
  { id: "biome_3", label: "???" },
  { id: "biome_4", label: "???" },
];

export const MapPanel: React.FC<MapPanelProps> = ({
  currentBiomeId,
  phase,
  onClose,
}) => {
  return (
    <div className="world-panel world-panel-map">
      {/* Unified header (matches Inventory frame) */}
      <div className="world-panel-header">
        <div>
          <div className="world-panel-kicker">Map</div>
          <div className="world-panel-title">World Map</div>
          <div className="world-panel-subtitle">
            You walk a ribbon between worlds. Current phase:{" "}
            <span className="world-panel-phase">{phase}</span>
          </div>
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
      </div>

      <div className="world-panel-body">
        <div className="map-panel">
          <div className="map-track">
            <div className="map-track-line" />
            <div className="map-track-nodes">
              {biomes.map((biome) => {
                const isActive = biome.id === currentBiomeId;

                return (
                  <button
                    key={biome.id}
                    type="button"
                    className={
                      "map-node" + (isActive ? " map-node--active" : "")
                    }
                    disabled={!isActive}
                  >
                    <span className="map-node-dot" />
                    <span className="map-node-label">{biome.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
