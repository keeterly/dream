// src/worldEvents/duskValleyEvents.ts

// If you add more events later, extend this union.
export type LocationEventId = "dusk_valley_distant_ruin";

export interface LocationEventDefinition {
  id: LocationEventId;
  biomeId: "dusk_valley";
  locationId: string;
  title: string;
  description: string;
  once: boolean;
}

/**
 * All special, one-off location events for Dusk Valley.
 */
export const DUSK_VALLEY_LOCATION_EVENTS: LocationEventDefinition[] = [
  {
    id: "dusk_valley_distant_ruin",
    biomeId: "dusk_valley",
    locationId: "distant_ruin",
    title: "The Distant Ruin",
    description:
      "The ruins sleep beneath a shroud of dust. Broken glyphs glimmer faintly along the stone, " +
      "answering the aether you carry. Something here remembers you.",
    once: true,
  },
];

/**
 * Find an event for the current biome + location, skipping events
 * that have already been resolved.
 */
export function findEventForLocation(
  biomeId: string,
  locationId: string,
  resolvedEventIds: string[]
): LocationEventDefinition | null {
  return (
    DUSK_VALLEY_LOCATION_EVENTS.find(
      (evt) =>
        evt.biomeId === biomeId &&
        evt.locationId === locationId &&
        (!evt.once || !resolvedEventIds.includes(evt.id))
    ) ?? null
  );
}
