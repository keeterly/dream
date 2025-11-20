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

function computeEncounterChance(
  profile: DreamselfProfile | null,
  inventory: InventoryItem[]
): number {
  // base chance once you're in the world
  let chance = 0.12;

  if (profile?.traits.primaryArchetype === "seer") {
    chance += 0.03; // seers notice more
  }
  if (profile?.traits.primaryArchetype === "wanderer") {
    chance += 0.01;
  }

  // small bonus per rare / legendary relic
  const bonusPerRelic = inventory.reduce((acc, item) => {
    if (item.rarity === "rare") return acc + 0.015;
    if (item.rarity === "legendary") return acc + 0.03;
    return acc;
  }, 0);

  chance += bonusPerRelic;

  // clamp to sane range
  if (chance < 0.03) chance = 0.03;
  if (chance > 0.4) chance = 0.4;

  return chance;
}

function getRandomWorldItem() {
  return WORLD_ITEMS[Math.floor(Math.random() * WORLD_ITEMS.length)];
}

const PHASES = ["Dawn", "Day", "Dusk", "Night"] as const;

function getPhaseFromTick(tick: number): string {
  // 48 ticks → full cycle (Dawn, Day, Dusk, Night)
  const segment = Math.floor((tick % 48) / 12);
  return PHASES[segment] ?? "Night";
}

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>("intro");

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [profile, setProfile] = useState<DreamselfProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [worldTick, setWorldTick] = useState(0);
  const [lastEncounterItemName, setLastEncounterItemName] = useState<
    string | null
  >(null);

  // The item currently being "found" in the world
  const [activeEncounterItem, setActiveEncounterItem] =
    useState<InventoryItem | null>(null);

  const {
    entries: journalEntries,
    logDreamselfCreated,
    logItemFound,
    logBiomeVisited,
  } = useJournal();

  // world tick + passive relic drops
  useEffect(() => {
    if (!profile || screen !== "world") return;

    const intervalId = window.setInterval(() => {
      // advance time-of-day
      setWorldTick((t) => t + 1);

      // don't start a new encounter if one is already active
      if (activeEncounterItem) return;

      const chance = computeEncounterChance(profile, inventory);

      if (Math.random() < chance) {
        const baseItem = getRandomWorldItem();
        const acquiredAt = new Date().toISOString();

        const invItem: InventoryItem = {
          ...baseItem,
          acquiredAt,
        };

        // add to inventory + journal immediately
        setInventory((prev) => [invItem, ...prev]);
        logItemFound(invItem);

        // drive world UI: this becomes the active encounter
        setLastEncounterItemName(invItem.name);
        setActiveEncounterItem(invItem);
      }

      // later: derive biome from worldTick and log
      // logBiomeVisited("dusk_valley", "twilight");
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [
    profile,
    screen,
    inventory,
    activeEncounterItem,
    logItemFound,
    logBiomeVisited,
  ]);

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
    // first arg = seed string, second arg = AnswerMap
    const nextProfile = computeTraitsAndAvatar("dream-seed", nextAnswers);

    setProfile(nextProfile);
    logDreamselfCreated(nextProfile);
    setScreen("summary");
  };

  const handleEnterWorld = () => {
    setScreen("world");
  };

  // Debug: force-spawn a relic encounter immediately
  const handleSpawnDebugItem = () => {
    const baseItem = getRandomWorldItem();
    const acquiredAt = new Date().toISOString();

    const invItem: InventoryItem = {
      ...baseItem,
      acquiredAt,
    };

    // add to inventory + journal
    setInventory((prev) => [invItem, ...prev]);
    logItemFound(invItem);

    // drive encounter UI (pause + bubble)
    setLastEncounterItemName(invItem.name);
    setActiveEncounterItem(invItem);
  };

  // Called by WorldStep when the player taps the "Relic Found" banner
  const handleResolveEncounter = () => {
    setActiveEncounterItem(null);
    setLastEncounterItemName(null);
  };

  const renderScreen = () => {
    const phase = getPhaseFromTick(worldTick);

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
  const encounterNameForLane =
    activeEncounterItem ? null : lastEncounterItemName;

  return (
    <WorldStep
      profile={profile}
      inventory={inventory}
      journalEntries={journalEntries as JournalEntry[]}
      onSpawnDebugItem={handleSpawnDebugItem}
      encounterItemName={encounterNameForLane}
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
