import React from "react";

interface BiomeMeta {
  id: string;
  label: string;
  isUnlocked: boolean;
}

interface MapPanelProps {
  currentBiomeId: string;
  phase: string;
  onClose?: () => void;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  currentBiomeId,
  phase,
  onClose,
}) => {
  const biomes: BiomeMeta[] = [
    { id: "dusk_valley", label: "Dusk Valley Ruins", isUnlocked: true },
    { id: "biome_2", label: "???", isUnlocked: false },
    { id: "biome_3", label: "???", isUnlocked: false },
    { id: "biome_4", label: "???", isUnlocked: false },
  ];

  const currentBiome =
    biomes.find((b) => b.id === currentBiomeId) ?? biomes[0];

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <section className="world-panel world-panel--map">
      {/* HEADER — matches Inventory-style layout */}
      <header
        className="world-panel-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div className="world-panel-kicker">Map</div>
          <div className="world-panel-title">World Map</div>
        </div>

        <button
          type="button"
          className="world-panel-modal-close"
          onClick={handleClose}
          aria-label="Close map"
        >
          ×
        </button>
      </header>

      {/* BODY */}
      <div className="world-panel-body map-panel">
        <p className="world-panel-subtitle">
          You walk a ribbon between worlds. Current phase:{" "}
          <span className="world-panel-emphasis">{phase}</span>
        </p>

        <div className="map-panel-track">
          {biomes.map((biome) => (
            <button
              key={biome.id}
              type="button"
              className={[
                "map-panel-node",
                biome.id === currentBiome.id ? "map-panel-node--active" : "",
                biome.isUnlocked ? "map-panel-node--unlocked" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!biome.isUnlocked}
            >
              <span className="map-panel-node-dot" />
              <span className="map-panel-node-label">{biome.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
