// src/App.tsx
import React, { useEffect, useState } from "react";
import "./App.css";

import { IntroStep } from "./components/layout/IntroStep";
import { QuestionStep } from "./components/layout/QuestionStep";
import { SummaryStep } from "./components/layout/SummaryStep";
import { WorldStep } from "./components/layout/WorldStep";

import { StartScreen } from "./components/start/StartScreen";
import { SettingsModal } from "./components/start/SettingsModal";

import { QUESTIONS } from "./questions";
import { computeTraitsAndAvatar } from "./traits";
import { WORLD_ITEMS } from "./worldItems";
import { useJournal } from "./hooks/useJournal";

// Map graph for Dusk Valley travel
import { DUSK_VALLEY_GRAPH } from "./worldMap/duskValleyGraph";

import { saveGameOnline, loadGameOnline } from "./persistence/remoteStorage";
import type { SavedGameState } from "./persistence/gameState";
import { CURRENT_SAVE_VERSION } from "./persistence/gameState";

import type {
  AnswerMap,
  DreamselfProfile,
  InventoryItem,
  JournalEntry,
} from "./types";

type ScreenId = "start" | "intro" | "questions" | "summary" | "world";

const PHASES = ["Dawn", "Day", "Dusk", "Night"] as const;

function getPhaseFromTick(tick: number): string {
  // 48 ticks → full cycle (Dawn, Day, Dusk, Night)
  const segment = Math.floor((tick % 48) / 12);
  return PHASES[segment] ?? "Night";
}

function getRandomWorldItem() {
  return WORLD_ITEMS[Math.floor(Math.random() * WORLD_ITEMS.length)];
}

export const App: React.FC = () => {
  // ----- GLOBAL SCREEN STATE -----
  const [screen, setScreen] = useState<ScreenId>("start");
  const [showSettings, setShowSettings] = useState(false);

  // ----- CHARACTER CREATION STATE -----
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [profile, setProfile] = useState<DreamselfProfile | null>(null);

  // ----- WORLD STATE -----
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [worldTick, setWorldTick] = useState(0);

  // ----- WORLD / MAP STATE -----
  // Only one biome for now, but keep setter so we can hydrate from save later.
  const [currentBiomeId, setCurrentBiomeId] =
    useState<"dusk_valley">("dusk_valley");

  // Start at the Valley Campfire hub in a fresh game.
  const [currentLocationId, setCurrentLocationId] =
    useState<string>("valley_campfire");

  const [discoveredLocations, setDiscoveredLocations] = useState<string[]>([
    "cave_of_departure",
    "riverbreak_path",
    "valley_campfire",
    // shard_overlook / sunken_plaza / murmuring_faults discovered as you travel
  ]);

  // ----- ENCOUNTERS -----
  const [encounterItemName, setEncounterItemName] = useState<string | null>(
    null
  );
  const [activeEncounterItem, setActiveEncounterItem] =
    useState<InventoryItem | null>(null);

  // Online save flags
  const [hasOnlineSave, setHasOnlineSave] = useState(false);
  const [loadingSave, setLoadingSave] = useState(true);

  const {
    entries: journalEntries,
    logDreamselfCreated,
    logItemFound,
    logBiomeVisited, // currently unused but keep for future
  } = useJournal();

  // ----- WORLD CLOCK (ONLY RUNS IN WORLD) -----
  useEffect(() => {
    if (screen !== "world") return;

    const id = window.setInterval(() => {
      setWorldTick((t) => t + 1);
    }, 8000);

    return () => window.clearInterval(id);
  }, [screen]);

  // ----- RANDOM ENCOUNTERS (ONLY RUNS IN WORLD) -----
  useEffect(() => {
    if (screen !== "world") return;

    // If an encounter is already active or visually on the ground, do nothing
    if (activeEncounterItem || encounterItemName) return;

    // Random delay between 8–20 seconds before next encounter
    const delay = 8000 + Math.random() * 12000;

    const id = window.setTimeout(() => {
      const baseItem = getRandomWorldItem();
      const acquiredAt = new Date().toISOString();

      const pending: InventoryItem = {
        ...baseItem,
        id: `${baseItem.id}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 6)}`,
        acquiredAt,
      };

      setActiveEncounterItem(pending);
      setEncounterItemName(baseItem.name);
    }, delay);

    return () => window.clearTimeout(id);
  }, [screen, activeEncounterItem, encounterItemName]);

  // ----- BOOTSTRAP FROM ONLINE SAVE ONCE -----
  useEffect(() => {
    let cancelled = false;

    async function bootstrapFromOnlineSave() {
      try {
        const saved = await loadGameOnline();
        if (!saved || cancelled) {
          setLoadingSave(false);
          return;
        }

        const {
          profile: savedProfile,
          inventory: savedInventory,
          journalEntries: savedJournalEntries,
          worldTick: savedWorldTick,
          currentBiomeId: savedBiomeId,
          currentLocationId: savedLocationId,
          discoveredLocations: savedDiscoveredLocations,
        } = saved as SavedGameState;

        setProfile(savedProfile);
        setInventory(savedInventory);
        // If you later add a journal hydrate method, call it here with savedJournalEntries.
        setWorldTick(savedWorldTick);

        // Map state with safe fallbacks for older saves
        if (savedBiomeId) {
          setCurrentBiomeId(savedBiomeId as "dusk_valley");
        }
        if (savedLocationId) {
          setCurrentLocationId(savedLocationId);
        }
        if (Array.isArray(savedDiscoveredLocations)) {
          setDiscoveredLocations(savedDiscoveredLocations);
        }

        setHasOnlineSave(true);
      } catch (err) {
        console.error("Error loading online save", err);
      } finally {
        if (!cancelled) {
          setLoadingSave(false);
        }
      }
    }

    bootstrapFromOnlineSave();

    return () => {
      cancelled = true;
    };
  }, []);

  // ----- SYNC ONLINE SAVE WHEN IN WORLD -----
  useEffect(() => {
    if (screen !== "world" || !profile) return;

    const stateToSave: SavedGameState = {
      version: CURRENT_SAVE_VERSION,     // ✅ add this line
      profile,
      inventory,
      journalEntries,
      worldTick,
      currentBiomeId,
      currentLocationId,
      discoveredLocations,
    };

    // fire-and-forget sync
    saveGameOnline(stateToSave).catch((err) => {
      console.error("Failed to sync save online", err);
    });
  }, [
    screen,
    profile,
    inventory,
    journalEntries,
    worldTick,
    currentBiomeId,
    currentLocationId,
    discoveredLocations,
  ]);

  // ----- TRAVEL HANDLERS -----
  const handleSelectMapLocation = (locationId: string) => {
    setCurrentLocationId(locationId);

    setDiscoveredLocations((prev) => {
      const next = new Set(prev);

      // Always mark the destination itself as discovered
      next.add(locationId);

      // Simple discovery rule: visiting a node reveals its neighbors
      const neighbors = DUSK_VALLEY_GRAPH[locationId] ?? [];
      neighbors.forEach((id) => next.add(id));

      return Array.from(next);
    });

    // Later: log to journal, trigger events, etc.
    // logBiomeVisited(currentBiomeId, locationId);
  };

  // ----- START SCREEN HANDLERS -----

  /** Reset character creation + world state and begin a fresh run. */
  const startCharacterCreation = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setProfile(null);
    setInventory([]);
    setWorldTick(0);
    setEncounterItemName(null);
    setActiveEncounterItem(null);

    // Reset map to fresh-state defaults
    setCurrentBiomeId("dusk_valley");
    setCurrentLocationId("valley_campfire");
    setDiscoveredLocations([
      "cave_of_departure",
      "riverbreak_path",
      "valley_campfire",
    ]);

    setScreen("intro");
  };

  /** Continue: if we have a profile, drop back into the world; otherwise start new. */
  const handleContinue = () => {
    if (profile) {
      setScreen("world");
    } else {
      startCharacterCreation();
    }
  };

  // ----- CHARACTER CREATION FLOW -----

  const handleBegin = () => {
    // From Intro → first question
    setScreen("questions");
  };

  const handleChooseAnswer = (questionId: string, optionId: string) => {
    const nextAnswers: AnswerMap = {
      ...answers,
      [questionId]: optionId,
    };
    setAnswers(nextAnswers);

    const isLast = currentQuestionIndex >= QUESTIONS.length - 1;
    if (!isLast) {
      setCurrentQuestionIndex((idx) => idx + 1);
      return;
    }

    // finished questionnaire → compute dreamself
    const nextProfile = computeTraitsAndAvatar("dream-seed", nextAnswers);
    setProfile(nextProfile);
    logDreamselfCreated(nextProfile);
    setScreen("summary");
  };

  const handleEnterWorld = () => {
    setScreen("world");
  };

  // ----- WORLD ENCOUNTER HELPERS -----

  // DEBUG: force-spawn a relic encounter immediately
  const handleSpawnDebugItem = () => {
    const baseItem = getRandomWorldItem();
    const acquiredAt = new Date().toISOString();

    const pending: InventoryItem = {
      ...baseItem,
      id: `${baseItem.id}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      acquiredAt,
    };

    setActiveEncounterItem(pending);
    setEncounterItemName(baseItem.name);
  };

  // Called by WorldStep once the pickup animation finishes (or auto-pickup fires)
  const handleResolveEncounter = () => {
    if (activeEncounterItem) {
      setInventory((prev) => [activeEncounterItem, ...prev]);
      logItemFound(activeEncounterItem);
    }

    setActiveEncounterItem(null);
    setEncounterItemName(null);
  };

  // ----- SCREEN RENDERING -----

  const renderScreen = () => {
    const phase = getPhaseFromTick(worldTick);

    if (screen === "start") {
      return (
        <StartScreen
          hasExistingProfile={!!profile || hasOnlineSave}
          onNewGame={startCharacterCreation}
          onContinue={handleContinue}
          onOpenSettings={() => setShowSettings(true)}
        />
      );
    }

    if (screen === "intro") {
      return <IntroStep onBegin={handleBegin} />;
    }

    if (screen === "questions") {
      return (
        <QuestionStep
          questions={QUESTIONS}
          currentIndex={currentQuestionIndex}
          answers={answers}
          onChooseAnswer={handleChooseAnswer}
        />
      );
    }

    if (screen === "summary" && profile) {
      return <SummaryStep profile={profile} onEnterWorld={handleEnterWorld} />;
    }

    if (screen === "world" && profile) {
      return (
        <WorldStep
          profile={profile}
          inventory={inventory}
          journalEntries={journalEntries as JournalEntry[]}
          onSpawnDebugItem={handleSpawnDebugItem}
          encounterItemName={encounterItemName}
          phase={phase}
          activeEncounterItem={activeEncounterItem}
          onResolveEncounter={handleResolveEncounter}
          // Map-related props
          currentBiomeId={currentBiomeId}
          currentLocationId={currentLocationId}
          discoveredLocations={discoveredLocations}
          onSelectMapLocation={handleSelectMapLocation}
        />
      );
    }

    // Fallback – should rarely hit
    return <IntroStep onBegin={handleBegin} />;
  };

  const isWorld = screen === "world";

  return (
    <>
      <div className={"App app-root" + (isWorld ? " app-root--world" : "")}>
        <main
          className={
            "App-main app-main" +
            (isWorld ? " app-main--world" : " app-main--creation")
          }
        >
          {renderScreen()}
        </main>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default App;
