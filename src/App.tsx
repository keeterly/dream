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

// 6x5 inventory grid capacity
const GRID_CAPACITY = 30;

function getPhaseFromTick(tick: number): string {
  // 48 ticks → full cycle (Dawn, Day, Dusk, Night)
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

  // Name used by WorldLane for the on-ribbon crystal
  const [encounterItemName, setEncounterItemName] =
    useState<string | null>(null);

  // The *actual* relic instance currently on the ground
  const [activeEncounterItem, setActiveEncounterItem] =
    useState<InventoryItem | null>(null);

  const {
    entries: journalEntries,
    logDreamselfCreated,
    logItemFound,
  } = useJournal();

  // ─────────────────────────────────────────────
  // WORLD TICK → time-of-day only
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!profile || screen !== "world") return;

    const intervalId = window.setInterval(() => {
      setWorldTick((t) => t + 1);
      // later: derive biome from worldTick and log if you want
      // logBiomeVisited("dusk_valley", "twilight");
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [profile, screen]);

  // ─────────────────────────────────────────────
  // INTRO / QUESTIONS FLOW
  // ─────────────────────────────────────────────
  const handleBegin = () => {
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

  // ─────────────────────────────────────────────
  // DEBUG SPAWN — ONLY creates a pending encounter
  // NO inventory mutation here
  // ─────────────────────────────────────────────
  const handleSpawnDebugItem = () => {
    // Don’t spawn if an encounter is already in progress
    if (activeEncounterItem) return;

    if (inventory.length >= GRID_CAPACITY) {
      // You can replace this with a nicer toast later
      alert("Your inventory is full. You can’t carry more relics.");
      return;
    }

    const baseItem = getRandomWorldItem();
    const acquiredAt = new Date().toISOString();

    const pending: InventoryItem = {
      ...baseItem,
      // Make the inventory instance unique, but keep base identity
      id: `${baseItem.id}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      acquiredAt,
    };

    // Drive world UI: this becomes the active encounter
    // Use the *type key* (base id), not the display name.
    setActiveEncounterItem(pending);
    setEncounterItemName(baseItem.id);
  };

  // ─────────────────────────────────────────────
  // PICKUP — the ONLY place items get added to inventory
  // Called by WorldStep after banner click or auto-pickup
  // ─────────────────────────────────────────────
  const handleResolveEncounter = () => {
    setActiveEncounterItem((pending) => {
      if (!pending) return null;

      setInventory((prev) => {
        if (prev.length >= GRID_CAPACITY) {
          alert("Your inventory is full. Free a slot before picking up relics.");
          return prev;
        }

        const updated = [...prev, pending];
        logItemFound(pending); // journal logs the *same* relic you saw

        return updated;
      });

      // Clear encounter visuals
      setEncounterItemName(null);
      return null;
    });
  };

  // ─────────────────────────────────────────────
  // RENDER SCREEN
  // ─────────────────────────────────────────────
  const phase = getPhaseFromTick(worldTick);

  const renderScreen = () => {
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
      return (
        <SummaryStep profile={profile} onEnterWorld={handleEnterWorld} />
      );
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
