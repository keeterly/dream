export type ArchetypeKey = "seer" | "architect" | "wanderer";
export type ElementKey = "glass" | "shadow" | "ember" | "bloom" | "aether";

export type CompanionType = "bird" | "fox" | "shadow";
export type CaveMarking = "cloak_shadow" | "stance_motion" | "sigil_memory";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  effects: {
    archetype?: Partial<Record<ArchetypeKey, number>>;
    element?: Partial<Record<ElementKey, number>>;
    temperamentTags?: string[];
    companionType?: CompanionType;
    caveMarking?: CaveMarking;
  };
}

export interface Question {
  id: string;
  prompt: string;
  subtitle?: string;
  options: QuestionOption[];
}

export interface ArchetypeScores {
  seer: number;
  architect: number;
  wanderer: number;
}

export interface ElementScores {
  glass: number;
  shadow: number;
  ember: number;
  bloom: number;
  aether: number;
}

export interface DreamTraits {
  primaryArchetype: ArchetypeKey;
  secondaryArchetype?: ArchetypeKey;
  dominantElement: ElementKey;
  secondaryElement?: ElementKey;
  temperamentTags: string[];
}

export type BodyType = "slim" | "tall" | "compact";
export type Posture = "upright" | "forward-leaning" | "relaxed";
export type HeadShape = "oval" | "angular" | "soft";
export type FaceDetailLevel = "minimal" | "medium";

export interface AvatarConfig {
  seed: string;
  bodyType: BodyType;
  posture: Posture;
  headShape: HeadShape;
  faceDetailLevel: FaceDetailLevel;
  primaryPalette: string;
  secondaryPalette: string;
  accentGlyphs: string[];
  cloakStyle: string;
  companionType?: CompanionType;
  caveMarking?: CaveMarking;
}

export interface DreamselfProfile {
  userId: string;
  dreamName: string;
  traits: DreamTraits;
  avatar: AvatarConfig;
  createdAt: string;
  lastUpdated: string;
}

// --- Journal types ---

export type JournalEntryType =
  | "dreamself_created"
  | "item_found"
  | "biome_visited";

export interface JournalEntry {
  id: string;
  type: JournalEntryType;
  timestampIso: string;
  title: string;
  body?: string;
  meta?: Record<string, unknown>;
}


export type TimeOfDayPhase = "dawn" | "noon" | "dusk" | "night";

export type ItemRarity = "common" | "rare" | "mythic";

export interface WorldItem {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
}

export interface InventoryItem extends WorldItem {
  acquiredAt: string; // ISO timestamp
}

// map of questionId -> optionId
export type AnswerMap = Record<string, string>;

// --- Journal types ---

export type JournalEntryType =
  | "dreamself_created"
  | "item_found"
  | "biome_visited";

export interface JournalEntry {
  id: string;
  type: JournalEntryType;
  timestampIso: string;
  title: string;
  body?: string;
  meta?: Record<string, unknown>;
}
