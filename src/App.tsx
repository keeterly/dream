import React, { useEffect, useState } from "react";
import "./App.css";

import { AppHeader } from "./components/layout/AppHeader";
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
  // Inventory is the *actual* carried relics
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // World clock for phase tint
  const [worldTick, setWorldTick] = useState(0);

  // Name of the item that’s visually on the ground in the world
  const [encounterItemName, setEncounterItemName] = useState<string | null>(
    null
  );

  // The specific inventory item currently being encountered
  const [activeEncounterItem, setActiveEncounterItem] =
    useState<InventoryItem | null>(null);

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
      // keep id unique per instance
      id: `${baseItem.id}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      acquiredAt,
    };

    // This is *only* the pending encounter. We do NOT add it
    // to inventory yet – that happens when WorldStep calls onResolveEncounter.
    setActiveEncounterItem(pending);

    // IMPORTANT: drive world UI using the *display name*
    // so world + inventory look up sprites from the same key.
    setEncounterItemName(baseItem.name);
  };

  // Called by WorldStep once the pickup animation finishes (or auto-pickup fires)
  const handleResolveEncounter = () => {
    if (activeEncounterItem) {
      // Add to inventory *here* so timing & identity match the pickup
      setInventory((prev) => [activeEncounterItem, ...prev]);
      logItemFound(activeEncounterItem);
    }

    // Clear encounter visual state
    setActiveEncounterItem(null);
    setEncounterItemName(null);
  };

  // ----- SCREEN RENDERING -----

  const renderScreen = () => {
    const phase = getPhaseFromTick(worldTick);

    if (screen === "start") {
      return (
        <StartScreen
          hasExistingProfile={!!profile}
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
        />
      );
    }

    // fallback
    return <IntroStep onBegin={handleBegin} />;
  };

  return (
    <>
      <div
        className={
          "App app-root" + (screen === "world" ? " app-root--world" : "")
        }
      >
        {/* Hide the old header on start + world screens */}
        {screen !== "world" && screen !== "start" && (
          <AppHeader screen={screen} />
        )}

        <main
          className={
            "App-main app-main" + (screen === "world" ? " app-main--world" : "")
          }
        >
          {renderScreen()}
        </main>
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default App;
