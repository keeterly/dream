import { Question } from "./types";

export const QUESTIONS: Question[] = [
  {
    id: "Q1",
    prompt: "At the edge of an unknown city, what guides your first step?",
    options: [
      {
        id: "Q1_A",
        label: "I move before I think.",
        description: "Instinct first, analysis later.",
        effects: {
          archetype: { wanderer: 2 },
          temperamentTags: ["impulsive", "kinetic"],
        },
      },
      {
        id: "Q1_B",
        label: "I study every shadow.",
        description: "Observation and patience.",
        effects: {
          archetype: { seer: 2 },
          temperamentTags: ["observant", "cautious"],
        },
      },
      {
        id: "Q1_C",
        label: "I look for patterns and structures.",
        description: "Strategy and design.",
        effects: {
          archetype: { architect: 2 },
          temperamentTags: ["strategic", "structured"],
        },
      },
    ],
  },
  {
    id: "Q2",
    prompt: "A light appears in the dark. What do you do?",
    options: [
      {
        id: "Q2_A",
        label: "Approach it head-on.",
        effects: {
          element: { glass: 2 },
          temperamentTags: ["bold"],
        },
      },
      {
        id: "Q2_B",
        label: "Circle it from afar.",
        effects: {
          element: { shadow: 2 },
          temperamentTags: ["careful", "liminal"],
        },
      },
      {
        id: "Q2_C",
        label: "Try to control it.",
        effects: {
          element: { ember: 2 },
          temperamentTags: ["assertive"],
        },
      },
    ],
  },
  {
    id: "Q3",
    prompt: "You find three relics. Which calls to you?",
    options: [
      {
        id: "Q3_A",
        label: "A broken mirror that reflects a future.",
        effects: {
          archetype: { seer: 2 },
          element: { glass: 1 },
          temperamentTags: ["prophetic"],
        },
      },
      {
        id: "Q3_B",
        label: "A key with no lock.",
        effects: {
          archetype: { wanderer: 2 },
          element: { aether: 1 },
          temperamentTags: ["exploratory"],
        },
      },
      {
        id: "Q3_C",
        label: "A blueprint etched on stone.",
        effects: {
          archetype: { architect: 2 },
          element: { ember: 1 },
          temperamentTags: ["builder"],
        },
      },
    ],
  },
  {
    id: "Q4",
    prompt: "When the world resists you, you…",
    options: [
      {
        id: "Q4_A",
        label: "Adapt and flow around it.",
        effects: {
          element: { bloom: 2 },
          temperamentTags: ["fluid", "patient"],
        },
      },
      {
        id: "Q4_B",
        label: "Stand your ground.",
        effects: {
          element: { shadow: 1, ember: 1 },
          temperamentTags: ["resolute"],
        },
      },
      {
        id: "Q4_C",
        label: "Rewrite the rules.",
        effects: {
          element: { aether: 2 },
          temperamentTags: ["disruptive"],
        },
      },
    ],
  },
  {
    id: "Q5",
    prompt: "You are not alone. Who walks with you first?",
    options: [
      {
        id: "Q5_A",
        label: "A quiet, watching bird.",
        effects: {
          archetype: { seer: 1 },
          temperamentTags: ["observant"],
          companionType: "bird",
        },
      },
      {
        id: "Q5_B",
        label: "A stray mechanical fox.",
        effects: {
          archetype: { architect: 1 },
          temperamentTags: ["inventive"],
          companionType: "fox",
        },
      },
      {
        id: "Q5_C",
        label: "A shadow that moves like you.",
        effects: {
          archetype: { wanderer: 1 },
          temperamentTags: ["introspective"],
          companionType: "shadow",
        },
      },
    ],
  },
  {
    id: "Q6",
    prompt: "As you leave the cave, you may take one shadow with you.",
    options: [
      {
        id: "Q6_A",
        label: "Fear of being seen.",
        effects: {
          temperamentTags: ["guarded"],
          caveMarking: "cloak_shadow",
        },
      },
      {
        id: "Q6_B",
        label: "Fear of standing still.",
        effects: {
          temperamentTags: ["restless"],
          caveMarking: "stance_motion",
        },
      },
      {
        id: "Q6_C",
        label: "Fear of forgetting.",
        effects: {
          temperamentTags: ["sentimental"],
          caveMarking: "sigil_memory",
        },
      },
    ],
  },
];
