// src/hooks/useBiomeLighting.ts
import { useMemo } from "react";

export type BiomePhase = "dawn" | "night" | "dusk" | "day";
export type ElementKey = "glass" | "shadow" | "ember" | "bloom" | "aether";

interface UseBiomeLightingArgs {
  phase?: string | null;
  element?: ElementKey | null;
}

/**
 * Returns:
 * - worldClass: CSS class for world root (controls global tint overlay)
 * - avatarClass: CSS class for avatar wrapper (controls filters / rimlight)
 */
export function useBiomeLighting({
  phase,
  element,
}: UseBiomeLightingArgs) {
  return useMemo(() => {
    const phaseNorm = (phase || "dawn").toLowerCase() as BiomePhase;

    // CSS classes we’ll use in WorldStep + AvatarView wrappers
    const worldClass = `world-step-phase-${phaseNorm}`;
    const avatarClass = `world-phase-${phaseNorm}`;

    // You can also expose element tints later if you want per-element styling
    const elementNorm = (element || "shadow") as ElementKey;

    return {
      worldClass,
      avatarClass,
      phase: phaseNorm,
      element: elementNorm,
    };
  }, [phase, element]);
}
