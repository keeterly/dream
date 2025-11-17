import React, { useMemo, useState } from "react";
import { QUESTIONS } from "./questions";
import { AnswerMap, computeTraitsAndAvatar } from "./traits";
import AvatarView from "./components/AvatarView";
import { DreamselfProfile, TimeOfDayPhase } from "./types";
import "./App.css";

const MOCK_USER_ID = "demo-user-1";

type Screen = "intro" | "questions" | "summary" | "binding" | "world";

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
  const [boundStatus, setBoundStatus] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[stepIndex] ?? null;
  const isComplete = stepIndex >= QUESTIONS.length;

  const phase = useMemo<TimeOfDayPhase>(
    () => getTimeOfDayPhase(new Date()),
    []
  );

  const handleAnswer = (questionId: string, optionId: string) => {
    const updated: AnswerMap = {
      ...answers,
      [questionId]: optionId,
    };
    setAnswers(updated);

    if (stepIndex < QUESTIONS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      const computed = computeTraitsAndAvatar(MOCK_USER_ID, updated);
      setProfile(computed);
      setStepIndex(stepIndex + 1);
      setScreen("summary");
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setProfile(null);
    setStepIndex(0);
    setScreen("intro");
    setBoundStatus(null);
  };

  const handleIntroContinue = () => {
    setScreen("questions");
  };

  const handleShowBinding = () => {
    setScreen("binding");
  };

  const handleShowWorld = () => {
    setScreen("world");
  };

  const progress = useMemo(() => {
    return Math.min(stepIndex / QUESTIONS.length, 1);
  }, [stepIndex]);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo">D.R.E.A.M.</div>
        <div className="app-subtitle">VENIA Dream Machine · Prototype v2</div>
      </header>

      <main className="app-main">
        <section className="app-panel">
          {screen === "intro" && (
            <IntroStep phase={phase} onContinue={handleIntroContinue} />
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
              phase={phase}
            />
          )}

          {screen === "summary" && profile && (
            <SummaryStep
              profile={profile}
              onRestart={handleRestart}
              onGoToBinding={handleShowBinding}
              onGoToWorld={handleShowWorld}
            />
          )}

          {screen === "binding" && (
            <BindingStep
              profile={profile}
              phase={phase}
              boundStatus={boundStatus}
              setBoundStatus={setBoundStatus}
              onBackToSummary={() => setScreen("summary")}
            />
          )}

          {screen === "world" && (
            <WorldStep
              profile={profile}
              phase={phase}
              onBackToSummary={() => setScreen("summary")}
            />
          )}
        </section>

        <section className="app-panel app-panel--avatar">
          {profile ? (
            <>
              <AvatarView avatar={profile.avatar} />
              <div className="avatar-meta">
                <div className="avatar-title">{profile.dreamName}</div>
                <div className="avatar-tags">
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
              </div>
            </>
          ) : (
            <>
              <div className="avatar-placeholder">
                <p>
                  A silhouette waits at the mouth of Plato&apos;s cave.
                  <br />
                  Begin the walk to call them into focus.
                </p>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

interface IntroStepProps {
  phase: TimeOfDayPhase;
  onContinue: () => void;
}

const IntroStep: React.FC<IntroStepProps> = ({ phase, onContinue }) => {
  const phaseLabel =
    phase === "dawn"
      ? "Dawn"
      : phase === "noon"
      ? "High Noon"
      : phase === "dusk"
      ? "Dusk"
      : "Night";

  return (
    <div className="intro-card">
      <div className="intro-tagline">Cave of Departure · {phaseLabel}</div>
      <h1 className="intro-title">You are leaving the shadows.</h1>
      <p className="intro-copy">
        In Plato&apos;s allegory, most stay chained to the wall, watching
        shadows and calling it truth. VENIA&apos;s D.R.E.A.M. Machine begins
        the moment you decide to step outside. Answer a few prompts and we&apos;ll
        sketch the first version of your Dreamself — the version of you that
        designs their own reality.
      </p>
      <div className="intro-meta">
        <span className="chip">Step 0 · Depart the cave</span>
        <span className="chip chip--ghost">No wallet. No RFIDs. Just you.</span>
      </div>
      <div className="summary-actions" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn" onClick={onContinue}>
          Leave the cave
        </button>
      </div>
    </div>
  );
};

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
  phase: TimeOfDayPhase;
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
  phase,
}) => {
  const phaseLabel =
    phase === "dawn"
      ? "Dawn"
      : phase === "noon"
      ? "High Noon"
      : phase === "dusk"
      ? "Dusk"
      : "Night";

  return (
    <div className="question-card">
      <div className="question-header">
        <div>
          <div className="question-step">
            Step {index + 1} of {total}
          </div>
          <div className="phase-pill">
            <span>World phase:</span>
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
              className={`option-card ${isSelected ? "option-card--selected" : ""}`}
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
        Each choice shapes your Dreamself&apos;s posture, palette, and story.
      </p>
    </div>
  );
};

interface SummaryStepProps {
  profile: DreamselfProfile;
  onRestart: () => void;
  onGoToBinding: () => void;
  onGoToWorld: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({
  profile,
  onRestart,
  onGoToBinding,
  onGoToWorld,
}) => {
  return (
    <div className="summary-card">
      <h1 className="summary-title">Your Dreamself leaves the cave.</h1>
      <p className="summary-subtitle">
        You are the <strong>{profile.dreamName}</strong>.
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
        <span className="chip">Element: {profile.traits.dominantElement}</span>
      </div>

      {profile.traits.temperamentTags.length > 0 && (
        <div className="summary-temperament">
          <div className="summary-label">Temperament:</div>
          <div className="summary-temperament-tags">
            {profile.traits.temperamentTags.map((tag) => (
              <span key={tag} className="chip chip--small">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="summary-json">
        <div className="summary-label">Profile JSON (for dev integration):</div>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>

      <div className="summary-actions">
        <button type="button" className="btn" onClick={onGoToBinding}>
          Bind a VENIA piece
        </button>
        <button type="button" className="btn btn--ghost" onClick={onGoToWorld}>
          Enter scrolling world
        </button>
        <button type="button" className="btn btn--ghost" onClick={onRestart}>
          Start Over
        </button>
      </div>
    </div>
  );
};

interface BindingStepProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  boundStatus: string | null;
  setBoundStatus: (value: string | null) => void;
  onBackToSummary: () => void;
}

const BindingStep: React.FC<BindingStepProps> = ({
  profile,
  phase,
  boundStatus,
  setBoundStatus,
  onBackToSummary,
}) => {
  const [rfid, setRfid] = useState("");
  const [order, setOrder] = useState("");

  const handleBind = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rfid || !order) {
      setBoundStatus("Enter both the NFC tag ID and order number to simulate binding.");
      return;
    }

    if (rfid.toLowerCase().includes("bound")) {
      setBoundStatus(
        "This tag is already marked as bound in this prototype. In production, this would be rejected."
      );
    } else {
      setBoundStatus(
        "Bound. In a live system, this piece would now be soulbound to this account and Dreamself."
      );
    }
  };

  const phaseLabel =
    phase === "dawn"
      ? "Dawn"
      : phase === "noon"
      ? "High Noon"
      : phase === "dusk"
      ? "Dusk"
      : "Night";

  return (
    <div className="binding-card">
      <div className="question-header">
        <div className="question-step">Prototype · Binding ritual</div>
        <div className="phase-pill">
          <span>World phase:</span>
          <strong>{phaseLabel}</strong>
        </div>
      </div>
      <h1 className="summary-title">Bind a VENIA garment to your Dreamself.</h1>
      <p className="intro-copy">
        In the full D.R.E.A.M. Machine, this step would happen when a customer
        taps an NFC hang tag. Here, we&apos;re just sketching the interaction:
        an RFID or tag ID plus an order number creates a one-way bond.
      </p>

      {profile && (
        <p className="summary-subtitle">
          Current Dreamself: <strong>{profile.dreamName}</strong>
        </p>
      )}

      <form className="binding-form" onSubmit={handleBind}>
        <div className="binding-row">
          <label htmlFor="rfid">NFC / RFID Tag ID (simulated)</label>
          <input
            id="rfid"
            className="binding-input"
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            placeholder="Scan result, UID, or demo ID"
          />
        </div>
        <div className="binding-row">
          <label htmlFor="order">Order number</label>
          <input
            id="order"
            className="binding-input"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="#VENIA-0000"
          />
        </div>
        <button type="submit" className="btn">
          Simulate binding
        </button>
      </form>

      {boundStatus && <div className="binding-status">{boundStatus}</div>}

      <div className="summary-actions">
        <button type="button" className="btn btn--ghost" onClick={onBackToSummary}>
          Back to Dreamself
        </button>
      </div>
    </div>
  );
};

interface WorldStepProps {
  profile: DreamselfProfile | null;
  phase: TimeOfDayPhase;
  onBackToSummary: () => void;
}

const WorldStep: React.FC<WorldStepProps> = ({
  profile,
  phase,
  onBackToSummary,
}) => {
  const phaseLabel =
    phase === "dawn"
      ? "Dawn"
      : phase === "noon"
      ? "High Noon"
      : phase === "dusk"
      ? "Dusk"
      : "Night";

  return (
    <div className="world-card">
      <div className="question-header">
        <div className="question-step">Prototype · Scrolling world stub</div>
        <div className="phase-pill">
          <span>World phase:</span>
          <strong>{phaseLabel}</strong>
        </div>
      </div>
      <h1 className="summary-title">The world begins to move around you.</h1>
      <p className="intro-copy">
        In the full experience, your Dreamself would walk left to right while
        the landscape scrolls — Tamagotchi-style — reacting to each bound VENIA
        piece and your archetype. This stub just marks where that loop plugs in.
      </p>

      <div className="world-strip">
        {profile ? (
          <>
            <p>
              <strong>{profile.dreamName}</strong> walks along a thin ribbon of
              light. As more VENIA garments are bound, new encounters, items,
              and scenes will be injected into this path.
            </p>
            <p>
              For now, this is a static description. On implementation, this
              region becomes a canvas for a side-scrolling scene that respects
              time-of-day, archetype, and bound inventory.
            </p>
          </>
        ) : (
          <p>
            Once your Dreamself is created, this lane becomes their journey —
            persistent between sessions, always picking up where you left off.
          </p>
        )}
      </div>

      <div className="summary-actions">
        <button type="button" className="btn btn--ghost" onClick={onBackToSummary}>
          Back to Dreamself
        </button>
      </div>
    </div>
  );
};

export default App;
