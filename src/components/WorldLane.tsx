import React, { useEffect, useState } from "react";
import { DreamselfProfile, TimeOfDayPhase } from "../types";

interface ParallaxLayer {
  name: string;
  order: number;
  depth: number;
  parallaxSpeed: number;
}

interface ParallaxConfig {
  canvas: {
    width: number;
    height: number;
  };
  layers: ParallaxLayer[];
}

interface WorldLaneProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  environmentId: string;
  encounterItemName: string | null;
}

const WorldLane: React.FC<WorldLaneProps> = ({
  encounterItemName,
}) => {
  const [config, setConfig] = useState<ParallaxConfig | null>(null);

  useEffect(() => {
    // NOTE: this assumes your Vite publicDir is src/public,
    // so these are served from /assets/...
    fetch("/assets/parallax/dusk_valley/parallax.json")
      .then((res) => res.json())
      .then((data: ParallaxConfig) => {
        // make sure layers are in the right order (back → front)
        const sorted = {
          ...data,
          layers: [...data.layers].sort((a, b) => a.order - b.order),
        };
        setConfig(sorted);
      })
      .catch((err) => {
        console.error("Failed to load parallax config", err);
      });
  }, []);

  if (!config) {
    // If the JSON isn't loaded yet, don't render the lane (avoids flicker).
    return null;
  }

  const baseDuration = 60; // seconds at parallaxSpeed 1.0

  return (
    <div className="world-lane">
      {config.layers.map((layer) => (
        <div
          key={layer.name}
          className={`world-lane-layer world-lane-layer--depth-${layer.depth}`}
          style={{
            backgroundImage: `url("/assets/parallax/dusk_valley/${layer.name}")`,
            // bigger parallaxSpeed = slower movement (further back),
            // smaller = faster (foreground)
            animationDuration: `${baseDuration * layer.parallaxSpeed}s`,
          }}
        />
      ))}

      {/* Character stays in place while world scrolls by */}
      <div className="world-lane-figure">
        <div className="world-lane-figure-shadow" />
        <div className="world-lane-figure-body">
          <div className="world-lane-figure-hood">
            <div className="world-lane-figure-face" />
          </div>
        </div>
      </div>

      {encounterItemName && (
        <div className="world-lane-encounter-pulse" aria-hidden="true" />
      )}
    </div>
  );
};

export default WorldLane;
