import React, { useEffect, useState } from "react";

interface ParallaxLayer {
  file: string;
  speed: number;
}

interface ParallaxConfig {
  layers: ParallaxLayer[];
}

const WorldLane: React.FC = () => {
  const [config, setConfig] = useState<ParallaxConfig | null>(null);

  useEffect(() => {
    fetch("/assets/parallax/dusk_valley/parallax.json")
      .then((res) => res.json())
      .then((data) => setConfig(data));
  }, []);

  if (!config) return null;

  return (
    <div className="world-lane">
      {config.layers.map((layer, index) => (
        <div
          key={index}
          className="world-layer"
          style={{
            backgroundImage: `url("/assets/parallax/dusk_valley/${layer.file}")`,
            animationDuration: `${60 / layer.speed}s`,
          }}
        />
      ))}

      {/* Character — stays centered */}
      <div className="world-character" />
    </div>
  );
};

export default WorldLane;