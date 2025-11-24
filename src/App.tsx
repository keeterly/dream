import React, { useEffect, useState } from "react";
import "./App.css";

import { AppHeader } from "./components/layout/AppHeader";
import { IntroStep } from "./components/layout/IntroStep";
import { QuestionStep } from "./components/layout/QuestionStep";
import { SummaryStep } from "./components/layout/SummaryStep";
import { WorldStep } from "./components/layout/WorldStep";

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

type ScreenId = "intro" | "questions" | "summary" | "world";

const PHASES = ["Dawn", "Day", "Dusk", "Night"] as const;

// Inventory capacity for your 6×5 grid
const GRID_CAPACITY = 30;

function getPhaseFromTick(tick: number): string {
  const segment = Math.floor((tick % 48) / 12);
  return PHASES[segment] ?? "Night";
}

function getRandomWorldItem() {
  return WORLD_ITEMS[Math.floor(Math.random() * WORLD_ITEMS.length)];
}

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>("intro");

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [profile, setProfile] = useState<DreamselfProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [worldTick, setWorldTick] = useState(0);

  // Current relic name shown to WorldLane for the crystal sprite
  const [encounterItemName, setEncounterItemName] =
    useState<string | null>(null);

  // The *actual object instance* waiting on the ground
  const [activeEncounterItem, setActiveEncounterItem] =
    useState<InventoryItem | null>(null);

  const {
    entries: journalEntries,
    logDreamselfCreated,
    logItemFound,
  } = useJournal();

  // ─────────────────────────────────────────────────────────────
  // WORLD TICK (time of day progression only; no auto-spawn here)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "world" || !profile) return;
    const id = window.setInterval(() => setWorldTick((t) => t + 1), 12000);
    return () => window.clearInterval(id);
  }, [screen, profile]);

  // ─────────────────────────────────────────────────────────────
  // BEGIN / QUESTIONS FLOW
  // ─────────────────────────────────────────────────────────────
  const handleBegin = () => setScreen("questions");

  const handleChooseAnswer = (questionId: string, optionId: string) => {
    const nextAnswers = { ...answers, [questionId]: optionId };
    setAnswers(nextAnswers);

    const isLast = currentQuestionIndex >= QUESTIONS.length - 1;

    if (!isLast) {
      setCurrentQuestionIndex((idx) => idx + 1);
      return;
    }

    // DONE → compute profile
    const nextProfile = computeTraitsAndAvatar("dream-seed", nextAnswers);
    setProfile(nextProfile);
    logDreamselfCreated(nextProfile);
    setScreen("summary");
  };

  const handleEnterWorld = () => setScreen("world");

  // ─────────────────────────────────────────────────────────────
  // DEBUG SPAWN — now CORRECTED so it **does not add to inventory**
  // ─────────────────────────────────────────────────────────────
  const handleSpawnDebugItem = () => {
    // Prevent duplicate encounters
    if (activeEncounterItem) return;

    if (inventory.length >= GRID_CAPACITY) {
      alert("Inventory full — cannot spawn more relics.");
      return;
    }

    const base = getRandomWorldItem();
    const pending: InventoryItem = {
      ...base,
      id: `${base.id}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      acquiredAt: new Date().toISOString(),
    };

    // Place it on the ground visually
    setActiveEncounterItem(pending);
    setEncounterItemName(pending.name);
  };

  // ─────────────────────────────────────────────────────────────
  // PICKUP (the ONLY place items get added to inventory)
  // Called from WorldStep after banner click or auto-pickup
  // ─────────────────────────────────────────────────────────────
  const handleResolveEncounter = () => {
    setActiveEncounterItem((pending) => {
      if (!pending) return null;

      setInventory((prev) => {
        if (prev.length >= GRID_CAPACITY) {
          alert("Inventory full — cannot pick up relic.");
          return prev;
        }

        const updated = [...prev, pending];
        logItemFound(pending); // goes to journal

        return updated;
      });

      // Clear world encounter UI
      setEncounterItemName(null);
      return null;
    });
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER SCREEN
  // ─────────────────────────────────────────────────────────────
  const phase = getPhaseFromTick(worldTick);

  const renderScreen = () => {
    if (screen === "intro") return <IntroStep onBegin={handleBegin} />;

    if (screen === "questions")
      return (
        <QuestionStep
          questions={QUESTIONS}
          currentIndex={currentQuestionIndex}
          answers={answers}
          onChooseAnswer={handleChooseAnswer}
        />
      );

    if (screen === "summary" && profile)
      return <SummaryStep profile={profile} onEnterWorld={handleEnterWorld} />;

    if (screen === "world" && profile)
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

    return <IntroStep onBegin={handleBegin} />;
  };

  return (
    <div className="App app-root">
      {screen !== "world" && <AppHeader screen={screen} />}
      <main
        className={
          "App-main app-main" +
          (screen === "world" ? " app-main--world" : "")
        }
      >
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
