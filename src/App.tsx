import React, { useMemo, useState, useEffect } from "react";
import { QUESTIONS } from "./questions";
import { AnswerMap, computeTraitsAndAvatar } from "./traits";
import AvatarView from "./components/AvatarView";
import WorldLane from "./components/WorldLane";
import { WORLD_ITEMS } from "./worldItems";
import {
  DreamselfProfile,
  TimeOfDayPhase,
  InventoryItem,
  WorldItem,
} from "./types";
import "./App.css";

const MOCK_USER_ID = "demo-user-1";

type Screen = "intro" | "questions" | "summary" | "world";
type EnvironmentId = "cave" | "ridge" | "field" | "shore" | "city";

const ENVIRONMENTS: EnvironmentId[] = ["cave", "ridge", "field", "shore", "city"];

function getTimeOfDayPhase(date: Date): TimeOfDayPhase {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return "dawn";
  if (hour >= 10 && hour < 16) return "noon";
  if (hour >= 16 && hour < 21) return "dusk";
  return "night";
}

function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [profile, setProfile] = useState<DreamselfProfile | null>(null);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lastFoundItem, setLastFoundItem] = useState<InventoryItem | null>(null);
  const [encounterItemName, setEncounterItemName] = useState<string | null>(null);
  const [worldTick, setWorldTick] = useState(0);

  const currentQuestion = QUESTIONS[stepIndex] ?? null;
  const isComplete = stepIndex >= QUESTIONS.length;

  const phase = useMemo<TimeOfDayPhase>(
    () => getTimeOfDayPhase(new Date()),
    []
  );

  const environmentId = useMemo<EnvironmentId>(
    () => ENVIRONMENTS[worldTick % ENVIRONMENTS.length],
    [worldTick]
  );

  // world clock – nudges encounters & environment cycling
  useEffect(() => {
    const id = window.setInterval(() => {
      setWorldTick((t) => t + 1);
    }, 12000);
    return () => window.clearInterval(id);
  }, []);

  const addItemToInventory = (item: WorldItem) => {
    const now = new Date().toISOString();

    setInventory((prev) => {
      if (prev.some((inv) => inv.id === item.id)) return prev;
      const nextItem: InventoryItem = { ...item, acquiredAt: now };
      return [...prev, nextItem];
    });

    const acquired: InventoryItem = { ...item, acquiredAt: now };
    setLastFoundItem(acquired);
    setEncounterItemName(item.name);

    window.setTimeout(() => {
      setEncounterItemName(null);
    }, 6000);
  };

  // passive encounters while walking
  useEffect(() => {
    if (!profile) return;
    const roll = Math.random();
    if (roll < 0.18) {
      const pool = WORLD_ITEMS;
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      addItemToInventory(candidate);
    }
  }, [worldTick, profile]);

  const handleDebugSpawnItem = () => {
    const pool = WORLD_ITEMS;
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    addItemToInventory(candidate);
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    const updated: AnswerMap = {
      ...answers,
      [questionId]: optionId,
    };
    setAnswers(updated);

    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex((idx) => idx + 1);
    } else {
      const computed = computeTraitsAndAvatar(MOCK_USER_ID, updated);
      setProfile(computed);
      setStepIndex((idx) => idx + 1);
      setScreen("summary");
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setProfile(null);
    setInventory([]);
    setLastFoundItem(null);
    setEncounterItemName(null);
    setStepIndex(0);
    setScreen("intro");
  };

  const handleIntroContinue = () => {
    setScreen("questions");
  };

  const handleGoToWorld = () => {
    setScreen("world");
  };

  const progress = useMemo(
    () => Math.min(stepIndex / QUESTIONS.length, 1),
    [stepIndex]
  );

  const phaseLabel =
    phase === "dawn"
      ? "Dawn"
      : phase === "noon"
      ? "High Noon"
      : phase === "dusk"
      ? "Dusk"
      : "Night";

  const isWorldScreen = screen === "world";

  return (
    <div className={isWorldScreen ? "app-root app-root--world" : "app-root"}>
      <header className="app-header">
        <div className="app-header-line" />
        <div className="app-header-main">
          <div className="app-logo">D.R.E.A.M.</div>
          <div className="app-header-meta">
            <span className="app-subtitle">VENIA Dream Machine</span>
            <span className="app-header-dot">•</span>
            <span className="app-subtitle app-subtitle--soft">
              Prototype v2 / Field
            </span>
          </div>
        </div>
        <div className="app-header-line app-header-line--faint" />
      </header>

      <main className={isWorldScreen ? "app-main app-main--world" : "app-main"}>
        <section className="app-panel app-panel--full">
          {screen === "intro" && (
            <IntroStep phaseLabel={phaseLabel} onContinue={handleIntroContinue} />
          )}

          {screen === "questions" && currentQuestion && !isComplete && (
            <QuestionStep
              index={stepIndex}
              total={QUESTIONS.length}
              questionId={currentQuestion.id}
              prompt={currentQuestion.prompt}
              options={currentQuestion.options}
              onAnswer={handleAnswer}
              selectedOptionId={answers[currentQuestion.id]}
              progress={progress}
              phaseLabel={phaseLabel}
            />
          )}

          {screen === "summary" && profile && (
            <SummaryStep
              profile={profile}
              phaseLabel={phaseLabel}
              onRestart={handleRestart}
              onGoToWorld={handleGoToWorld}
            />
          )}

          {screen === "world" && (
            <WorldStep
              profile={profile}
              phase={phase}
              inventory={inventory}
              lastFoundItem={lastFoundItem}
              encounterItemName={encounterItemName}
              environmentId={environmentId}
              onDebugSpawnItem={handleDebugSpawnItem}
              onBackToSummary={() => setScreen("summary")}
            />
          )}
        </section>
      </main>
    </div>
  );
}

/* ---------- Intro (Cave of Departure) ---------- */

interface IntroStepProps {
  phaseLabel: string;
  onContinue: () => void;
}

const IntroStep: React.FC<IntroStepProps> = ({ phaseLabel, onContinue }) => {
  return (
    <div className="intro-shell">
      <div className="intro-card intro-card--centered intro-card--glass">
        <div className="intro-tagline">CHAPTER 00 · Cave of Departure</div>
        <h1 className="intro-title">You are leaving the shadows.</h1>
        <p className="intro-copy">
          In Plato&apos;s allegory, most stay chained to the wall, watching
          shadows and calling it truth. VENIA&apos;s D.R.E.A.M. Machine begins
          the moment you decide to step outside. Answer a few prompts and
          we&apos;ll sketch the first version of your Dreamself — the version of
          you that designs their own reality.
        </p>
        <div className="intro-meta">
          <span className="chip">Phase: {phaseLabel}</span>
          <span className="chip chip--ghost">No wallet. No RFIDs. Just you.</span>
        </div>
        <div className="summary-actions intro-actions">
          <button type="button" className="btn" onClick={onContinue}>
            Leave the cave
          </button>
        </div>
      </div>

      <div className="intro-hero-art">
        <div className="intro-hero-moon" />
        <div className="intro-hero-ridge intro-hero-ridge--back" />
        <div className="intro-hero-ridge intro-hero-ridge--front" />
        <div className="intro-hero-figure" />
        <div className="intro-hero-scanlines" />
      </div>
    </div>
  );
};

/* ---------- Question Flow ---------- */

interface QuestionStepProps {
  index: number;
  total: number;
  questionId: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    description?: string;
  }[];
  selectedOptionId?: string;
  onAnswer: (questionId: string, optionId: string) => void;
  progress: number;
  phaseLabel: string;
}

const QuestionStep: React.FC<QuestionStepProps> = ({
  index,
  total,
  questionId,
  prompt,
  options,
  selectedOptionId,
  onAnswer,
  progress,
  phaseLabel,
}) => {
  return (
    <div className="question-card">
      <div className="question-header">
        <div>
          <div className="question-step">
            QUERY {index + 1}
            <span className="question-step-divider">/</span>
            {total}
          </div>
          <div className="phase-pill">
            <span>WORLD PHASE</span>
            <strong>{phaseLabel}</strong>
          </div>
        </div>
        <div className="question-progress">
          <div className="question-progress-bar">
            <div
              className="question-progress-bar-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
      <h1 className="question-prompt">{prompt}</h1>
      <div className="question-options">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              className={`option-card ${
                isSelected ? "option-card--selected" : ""
              }`}
              onClick={() => onAnswer(questionId, opt.id)}
              type="button"
            >
              <div className="option-label">{opt.label}</div>
              {opt.description && (
                <div className="option-description">{opt.description}</div>
              )}
            </button>
          );
        })}
      </div>
      <p className="question-hint">
        Each choice shifts your Dreamself&apos;s posture, palette, and story —
        like choosing a job class in a quiet RPG.
      </p>
    </div>
  );
};

/* ---------- Birth / Summary Screen ---------- */

interface SummaryStepProps {
  profile: DreamselfProfile;
  phaseLabel: string;
  onRestart: () => void;
  onGoToWorld: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({
  profile,
  phaseLabel,
  onRestart,
  onGoToWorld,
}) => {
  return (
    <div className="summary-hero">
      <div className="summary-chapter-label">
        CHAPTER 01 · Dreamself Awakening
      </div>

      <div className="summary-hero-avatar">
        <AvatarView avatar={profile.avatar} />
      </div>

      <div className="summary-hero-meta">
        <h1 className="summary-title">Your Dreamself leaves the cave.</h1>
        <p className="summary-subtitle">
          You are <span className="summary-dream-name">{profile.dreamName}</span>.
        </p>

        <div className="summary-tags">
          <span className="chip">
            Archetype: {profile.traits.primaryArchetype}
          </span>
          {profile.traits.secondaryArchetype && (
            <span className="chip chip--ghost">
              + {profile.traits.secondaryArchetype}
            </span>
          )}
          <span className="chip">
            Element: {profile.traits.dominantElement}
          </span>
          <span className="chip chip--ghost">Phase: {phaseLabel}</span>
        </div>
      </div>

      <div className="summary-actions summary-hero-actions">
        <button type="button" className="btn" onClick={onGoToWorld}>
          Do you want to begin our adventure?
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Start Over
        </button>
      </div>
    </div>
  );
};

/* ---------- World / Scrolling Lane Screen ---------- */

interface WorldStepProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  inventory: InventoryItem[];
  lastFoundItem: InventoryItem | null;
  encounterItemName: string | null;
  environmentId: EnvironmentId;
  onDebugSpawnItem: () => void;
  onBackToSummary: () => void;
}

const WorldStep: React.FC<WorldStepProps> = ({
  profile,
  phase,
  inventory,
  lastFoundItem,
  encounterItemName,
  environmentId,
  onDebugSpawnItem,
  onBackToSummary,
}) => {
  const [activePanel, setActivePanel] = useState<
    "inventory" | "character" | "map" | "debug" | null
  >(null);

  const phaseLabel =
    phase === "dawn"
      ? "Dawn"
      : phase === "noon"
      ? "High Noon"
      : phase === "dusk"
      ? "Dusk"
      : "Night";

  const togglePanel = (panel: "inventory" | "character" | "map" | "debug") => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <div className="world-card">
      {/* Full-screen world lane as the background */}
      <WorldLane
        profile={profile}
        phase={phase}
        environmentId={environmentId}
        encounterItemName={encounterItemName}
      />

      {/* Everything else floats on top of the lane */}
      <div className="world-overlay-main">
        <div>
          <div className="world-hud">
            <div className="world-hud-left">
              <div className="world-hud-title">FIELD · SCROLLING WORLD</div>
              <div className="world-hud-name">
                {profile ? profile.dreamName : "UNBOUND DREAMSELF"}
                <span className="world-hud-level">LV 01</span>
              </div>
            </div>
            <div className="world-hud-right">
              <div className="world-hud-phase-label">PHASE</div>
              <div className="world-hud-phase-value">{phaseLabel}</div>
            </div>
          </div>

         

          {lastFoundItem && (
            <div className="world-event-toast">
              <div className="world-event-icon" />
              <div className="world-event-copy">
                <div className="world-event-title">
                  {lastFoundItem.name} <span>Found!</span>
                </div>
                <div className="world-event-desc">
                  {lastFoundItem.description}
                </div>
                <div className="world-event-meta">
                  LOOT RARITY
                  <span
                    className={`world-event-rarity world-event-rarity--${lastFoundItem.rarity}`}
                  >
                    {lastFoundItem.rarity}
                  </span>
                  <span className="world-event-gain">MEMORY +1</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* bottom status row */}
        <div className="world-overlay-bottom">
          <div className="world-status">
            <div className="world-status-column">
              <div className="world-status-label">VIT</div>
              <div className="world-status-bar" title="VIT 132 / 132">
                <div className="world-status-fill world-status-fill--vit" />
              </div>
            </div>
            <div className="world-status-column">
              <div className="world-status-label">AETHER</div>
              <div className="world-status-bar" title="AETHER 58 / 72">
                <div className="world-status-fill world-status-fill--aether" />
              </div>
            </div>
            <div className="world-status-column">
              <div className="world-status-label">MEMORY</div>
              <div className="world-status-bar" title="MEMORY 4 / 12">
                <div className="world-status-fill world-status-fill--memory" />
              </div>
            </div>
          </div>

          <div className="world-bottom-row">
            <button
              type="button"
              className="btn btn--ghost world-back-btn"
              onClick={onBackToSummary}
            >
              Back to Dreamself
            </button>
          </div>
        </div>
      </div>

      {/* dock icons */}
      <div className="world-dock">
        <button
          type="button"
          className={`world-dock-btn ${
            activePanel === "inventory" ? "world-dock-btn--active" : ""
          }`}
          onClick={() => togglePanel("inventory")}
        >
          <span className="world-dock-icon world-dock-icon--inventory" />
          <span className="world-dock-label">Inventory</span>
        </button>
        <button
          type="button"
          className={`world-dock-btn ${
            activePanel === "character" ? "world-dock-btn--active" : ""
          }`}
          onClick={() => togglePanel("character")}
        >
          <span className="world-dock-icon world-dock-icon--character" />
          <span className="world-dock-label">Dreamself</span>
        </button>
        <button
          type="button"
          className={`world-dock-btn ${
            activePanel === "map" ? "world-dock-btn--active" : ""
          }`}
          onClick={() => togglePanel("map")}
        >
          <span className="world-dock-icon world-dock-icon--map" />
          <span className="world-dock-label">Map</span>
        </button>
        <button
          type="button"
          className={`world-dock-btn ${
            activePanel === "debug" ? "world-dock-btn--active" : ""
          }`}
          onClick={() => togglePanel("debug")}
        >
          <span className="world-dock-icon world-dock-icon--debug" />
          <span className="world-dock-label">Debug</span>
        </button>
      </div>

      {/* slide-up panels */}
      <div
        className={`world-panel-shell ${
          activePanel ? "world-panel-shell--visible" : ""
        }`}
      >
        {activePanel === "inventory" && (
          <div className="world-panel">
            <div className="world-panel-header">
              <span>Inventory</span>
              <button
                type="button"
                className="world-panel-close"
                onClick={() => setActivePanel(null)}
              >
                ×
              </button>
            </div>
            {inventory.length === 0 ? (
              <div className="world-inventory-empty">
                No items yet. Walk the ribbon or trigger a debug item to populate
                this.
              </div>
            ) : (
              <ul className="world-inventory-list">
                {inventory.map((item) => (
                  <li
                    key={item.id}
                    className={`world-inventory-item world-inventory-item--${item.rarity}`}
                  >
                    <div className="world-inventory-item-name">
                      {item.name}
                    </div>
                    <div className="world-inventory-item-desc">
                      {item.description}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activePanel === "character" && (
          <div className="world-panel">
            <div className="world-panel-header">
              <span>Dreamself</span>
              <button
                type="button"
                className="world-panel-close"
                onClick={() => setActivePanel(null)}
              >
                ×
              </button>
            </div>
            {profile ? (
              <div className="world-panel-character">
                <div className="world-panel-character-avatar">
                  <AvatarView avatar={profile.avatar} />
                </div>
                <div className="world-panel-character-meta">
                  <h2>{profile.dreamName}</h2>
                  <div className="summary-tags">
                    <span className="chip">
                      Archetype: {profile.traits.primaryArchetype}
                    </span>
                    {profile.traits.secondaryArchetype && (
                      <span className="chip chip--ghost">
                        + {profile.traits.secondaryArchetype}
                      </span>
                    )}
                    <span className="chip">
                      Element: {profile.traits.dominantElement}
                    </span>
                  </div>
                  {profile.traits.temperamentTags.length > 0 && (
                    <>
                      <div className="summary-label">Temperament</div>
                      <div className="summary-temperament-tags">
                        {profile.traits.temperamentTags.map((tag) => (
                          <span key={tag} className="chip chip--small">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="world-inventory-empty">
                Your Dreamself has not yet taken shape.
              </div>
            )}
          </div>
        )}

        {activePanel === "map" && (
          <div className="world-panel">
            <div className="world-panel-header">
              <span>Map · Dream Domains</span>
              <button
                type="button"
                className="world-panel-close"
                onClick={() => setActivePanel(null)}
              >
                ×
              </button>
            </div>
            <p className="world-debug-copy">
              Prototype map view. Imagine zooming out to see every domain your
              Dreamself has crossed: the Cave of Departure, the Scrolling
              Ribbon, future cityscapes, and other VENIA spaces.
            </p>
            <div className="world-map-track">
              <div className="world-map-node world-map-node--visited">
                <span>Cave</span>
              </div>
              <div className="world-map-connector" />
              <div className="world-map-node world-map-node--current">
                <span>Scrolling World</span>
              </div>
              <div className="world-map-connector" />
              <div className="world-map-node">
                <span>Future Domain</span>
              </div>
              <div className="world-map-connector" />
              <div className="world-map-node">
                <span>Retail Realm</span>
              </div>
            </div>
          </div>
        )}

        {activePanel === "debug" && (
          <div className="world-panel">
            <div className="world-panel-header">
              <span>Debug · Item Spawn</span>
              <button
                type="button"
                className="world-panel-close"
                onClick={() => setActivePanel(null)}
              >
                ×
              </button>
            </div>
            <p className="world-debug-copy">
              This menu is for tuning drop rates and testing encounters. In a
              live build, events can fire even while the player is away, keyed to
              their Dreamself and bound VENIA pieces.
            </p>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onDebugSpawnItem}
            >
              Spawn random item event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
