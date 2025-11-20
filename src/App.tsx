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
  const [lastEncounterItemName, setLastEncounterItemName] = useState<
    string | null
  >(null);

  const {
    entries: journalEntries,
    logDreamselfCreated,
    logItemFound,
    logBiomeVisited,
  } = useJournal();

  // world tick + passive relic drops
  useEffect(() => {
    if (!profile) return;

    const intervalId = window.setInterval(() => {
      setWorldTick((t) => t + 1);

      // 18% chance to roll a new relic
      if (Math.random() < 0.18) {
        const baseItem = getRandomWorldItem();
        const acquiredAt = new Date().toISOString();

        const invItem: InventoryItem = {
          ...baseItem,
          acquiredAt,
        };

        setInventory((prev) => [invItem, ...prev]);
        setLastEncounterItemName(invItem.name);
        logItemFound(invItem);
      }

      // later: derive biome from worldTick and log
      // logBiomeVisited("dusk_valley", "twilight");
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [profile, logItemFound, logBiomeVisited]);

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
   const nextProfile = computeTraitsAndAvatar(nextAnswers, QUESTIONS);

    setProfile(nextProfile);
    logDreamselfCreated(nextProfile);
    setScreen("summary");
  };

  const handleEnterWorld = () => {
    setScreen("world");
  };

  const handleSpawnDebugItem = () => {
    const baseItem = getRandomWorldItem();
    const acquiredAt = new Date().toISOString();

    const invItem: InventoryItem = {
      ...baseItem,
      acquiredAt,
    };

    setInventory((prev) => [invItem, ...prev]);
    setLastEncounterItemName(invItem.name);
    logItemFound(invItem);
  };

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
          encounterItemName={lastEncounterItemName}
        />
      );
    }

    return <IntroStep onBegin={handleBegin} />;
  };

  return (
    <div className="app-root">
      <AppHeader screen={screen} />
      <main className="app-main">{renderScreen()}</main>
    </div>
  );
};

export default App;
