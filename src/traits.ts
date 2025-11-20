import {
  ArchetypeKey,
  ArchetypeScores,
  AvatarConfig,
  CaveMarking,
  CompanionType,
  DreamTraits,
  DreamselfProfile,
  ElementKey,
  ElementScores,
} from "./types";
import { QUESTIONS } from "./questions";

export type AnswerMap = Record<string, string>;

const archetypeOrder: ArchetypeKey[] = ["seer", "architect", "wanderer"];
const elementOrder: ElementKey[] = ["glass", "shadow", "ember", "bloom", "aether"];

function initArchetypeScores(): ArchetypeScores {
  return { seer: 0, architect: 0, wanderer: 0 };
}

function initElementScores(): ElementScores {
  return { glass: 0, shadow: 0, ember: 0, bloom: 0, aether: 0 };
}

export function getOption(questionId: string, optionId: string) {
  const q = QUESTIONS.find((q) => q.id === questionId);
  if (!q) return undefined;
  return q.options.find((o) => o.id === optionId);
}

export function buildSeed(answers: AnswerMap): string {
  const entries = Object.entries(answers).sort(([a,], [b,]) => a.localeCompare(b));
  return entries.map(([qId, ans]) => `${qId}:${ans}`).join("|");
}

export function computeTraitsAndAvatar(
  userId: string,
  answers: AnswerMap
): DreamselfProfile {
  const archetypeScores = initArchetypeScores();
  const elementScores = initElementScores();
  const temperamentTags = new Set<string>();
  let companionType: CompanionType | undefined;
  let caveMarking: CaveMarking | undefined;

  Object.entries(answers).forEach(([questionId, optionId]) => {
    const opt = getOption(questionId, optionId);
    if (!opt) return;
    const effects = opt.effects;

    if (effects.archetype) {
      for (const [key, value] of Object.entries(effects.archetype)) {
        const k = key as ArchetypeKey;
        archetypeScores[k] += value ?? 0;
      }
    }

    if (effects.element) {
      for (const [key, value] of Object.entries(effects.element)) {
        const k = key as ElementKey;
        elementScores[k] += value ?? 0;
      }
    }

    effects.temperamentTags?.forEach((tag) => temperamentTags.add(tag));
    if (effects.companionType) companionType = effects.companionType;
    if (effects.caveMarking) caveMarking = effects.caveMarking;
  });

  const primaryArchetype = pickPrimary(archetypeScores, archetypeOrder);
  const secondaryArchetype = pickSecondary(
    archetypeScores,
    archetypeOrder,
    primaryArchetype
  );

  const dominantElement = pickPrimary(elementScores, elementOrder);
  const secondaryElement = pickSecondary(
    elementScores,
    elementOrder,
    dominantElement
  );

  const traits: DreamTraits = {
    primaryArchetype,
    secondaryArchetype,
    dominantElement,
    secondaryElement,
    temperamentTags: Array.from(temperamentTags),
  };

    const seed = buildSeed(answers);

  const avatar = buildAvatarConfig(
    seed,
    traits,
    companionType,
    caveMarking
  );


  const now = new Date().toISOString();
  const dreamName = buildDreamName(traits);

  const profile: DreamselfProfile = {
    userId,
    dreamName,
    traits,
    avatar,
    createdAt: now,
    lastUpdated: now,
  };

  return profile;
}

function pickPrimary<T extends string>(
  scores: Record<T, number>,
  order: T[]
): T {
  let best: T = order[0];
  let bestScore = -Infinity;
  for (const key of order) {
    const score = scores[key] ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}

function pickSecondary<T extends string>(
  scores: Record<T, number>,
  order: T[],
  primary: T
): T | undefined {
  let best: T | undefined;
  let bestScore = -Infinity;
  for (const key of order) {
    if (key === primary) continue;
    const score = scores[key] ?? 0;
    if (score > bestScore && score > 0) {
      bestScore = score;
      best = key;
    }
  }
  return best;
}

const archetypeVisuals: Record<
  ArchetypeKey,
  Pick<AvatarConfig, "bodyType" | "posture" | "cloakStyle" | "accentGlyphs">
> = {
  seer: {
    bodyType: "slim",
    posture: "upright",
    cloakStyle: "mantle_open",
    accentGlyphs: ["seer_eye", "ring_aura"],
  },
  architect: {
    bodyType: "tall",
    posture: "upright",
    cloakStyle: "structured",
    accentGlyphs: ["geo_lines", "grid_fragment"],
  },
  wanderer: {
    bodyType: "compact",
    posture: "forward-leaning",
    cloakStyle: "asym_trail",
    accentGlyphs: ["path_curve", "footstep"],
  },
};

const elementPalettes: Record<
  ElementKey,
  { primary: string; secondary: string }
> = {
  glass: { primary: "#C7E5FF", secondary: "#7FB7FF" },
  shadow: { primary: "#151521", secondary: "#5D5D7A" },
  ember: { primary: "#3C1F15", secondary: "#E89A4A" },
  bloom: { primary: "#233428", secondary: "#B5E3C2" },
  aether: { primary: "#1E1B2E", secondary: "#C9B5FF" },
};

function buildAvatarConfig(
  seed: string,
  traits: DreamTraits,
  companionType?: CompanionType,
  caveMarking?: CaveMarking
): AvatarConfig {
  const archetype = traits.primaryArchetype;
  const visuals = archetypeVisuals[archetype];

  const element = traits.dominantElement;
  const palette = elementPalettes[element];

  const headShape: AvatarConfig["headShape"] =
    archetype === "architect" ? "angular" : archetype === "seer" ? "oval" : "soft";

  let faceDetailLevel: AvatarConfig["faceDetailLevel"] = "medium";
  if (traits.temperamentTags.includes("guarded")) {
    faceDetailLevel = "minimal";
  }

  return {
    seed,
    bodyType: visuals.bodyType,
    posture: visuals.posture,
    headShape,
    faceDetailLevel,
    primaryPalette: palette.primary,
    secondaryPalette: palette.secondary,
    accentGlyphs: visuals.accentGlyphs,
    cloakStyle: visuals.cloakStyle,
    companionType,
    caveMarking,
  };
}

function buildDreamName(traits: DreamTraits): string {
  const arch = traits.primaryArchetype;
  const elem = traits.dominantElement;

  const archName =
    arch === "seer"
      ? "Seer"
      : arch === "architect"
      ? "Architect"
      : "Wanderer";

  const elemName =
    elem === "glass"
      ? "Glass"
      : elem === "shadow"
      ? "Shadow"
      : elem === "ember"
      ? "Ember"
      : elem === "bloom"
      ? "Bloom"
      : "Aether";

  return `${archName} of ${elemName}`;
}
