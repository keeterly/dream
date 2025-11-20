import { useCallback, useState } from "react";
import type {
  DreamselfProfile,
  InventoryItem,
  JournalEntry,
  JournalEntryType,
} from "../types";

function makeEntryId(type: JournalEntryType): string {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useJournal(initialEntries: JournalEntry[] = []) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);

  const logEntry = useCallback((entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const logDreamselfCreated = useCallback(
    (profile: DreamselfProfile) => {
      const entry: JournalEntry = {
        id: makeEntryId("dreamself_created"),
        type: "dreamself_created",
        timestampIso: new Date().toISOString(),
        title: `Dreamself awakened: ${profile.dreamName}`,
        // keep body generic so we don't depend on element fields
        body: `Primary archetype: ${profile.traits.primaryArchetype}.`,
        meta: { profile },
      };
      logEntry(entry);
    },
    [logEntry]
  );

  const logItemFound = useCallback(
    (item: InventoryItem) => {
      const entry: JournalEntry = {
        id: makeEntryId("item_found"),
        type: "item_found",
        timestampIso: new Date().toISOString(),
        title: `Found relic: ${item.name}`,
        body: item.description,
        meta: { item },
      };
      logEntry(entry);
    },
    [logEntry]
  );

  const logBiomeVisited = useCallback(
    (environmentId: string, phase: string) => {
      const entry: JournalEntry = {
        id: makeEntryId("biome_visited"),
        type: "biome_visited",
        timestampIso: new Date().toISOString(),
        title: `Entered biome: ${environmentId}`,
        body: `Phase: ${phase}`,
        meta: { environmentId, phase },
      };
      logEntry(entry);
    },
    [logEntry]
  );

  return {
    entries,
    logDreamselfCreated,
    logItemFound,
    logBiomeVisited,
  };
}
