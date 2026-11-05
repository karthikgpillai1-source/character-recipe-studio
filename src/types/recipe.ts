export type Category = "Fictional" | "Historical" | "Original" | "Assistant" | "Other";

export type SourceType =
  | "Movie"
  | "TV"
  | "Anime"
  | "Game"
  | "Book"
  | "Comic"
  | "Manga"
  | "Web Series"
  | "Real World"
  | "Custom";

export interface Identity {
  name: string;
  avatar: string | null;
  description: string;
  category: Category | "";
  sourceType: SourceType | "";
  sourceMaterial: string | null;
  tags: string[];
  alias: string;
  franchise: string;
  universe: string;
  version: string;
  age: string;
  occupation: string;
  species: string;
  location: string;
}

export interface PersonalityProfile {
  introversion: number;
  extroversion: number;
  patience: number;
  aggression: number;
  humor: number;
  empathy: number;
  curiosity: number;
  confidence: number;
  optimism: number;
  emotionalStability: number;
  configuredTraits?: string[];
}

export type Tone = "Formal" | "Casual" | "Professional" | "Friendly" | "Aggressive" | "Reserved" | "";
export type Vocabulary = "Simple" | "Average" | "Advanced" | "";
export type ResponseLength = "Very Short" | "Short" | "Medium" | "Long" | "";

export interface SpeechProfile {
  tone: Tone;
  vocabulary: Vocabulary;
  responseLength: ResponseLength;
  usesSlang: boolean;
  usesHumor: boolean;
  usesProfanity: boolean;
  usesCatchphrases: boolean;
  catchphraseList: string[];
}

export interface CoreValue {
  id: string;
  importance: number;
  description: string;
}

export interface Goals {
  primary: string;
  secondary: string;
  longTerm: string;
  shortTerm: string;
}

export interface BehaviorRules {
  always: string[];
  never: string[];
  usually: string[];
  avoid: string[];
}

export interface Restrictions {
  hard: string[];
  soft: string[];
}

export interface KnowledgeReference {
  id: string;
  type: "pdf" | "docx" | "txt" | "website";
  path: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeProfile {
  knownTopics: string[];
  unknownTopics: string[];
  expertTopics: string[];
  forbiddenTopics: string[];
  references: KnowledgeReference[];
}

export interface Relationship {
  id: string;
  name: string;
  type: string;
  trustLevel: number;
  description: string;
}

export interface EmotionalResponse {
  description: string;
  exampleDialogue: string;
}

export interface EmotionalResponses {
  praise: EmotionalResponse;
  criticism: EmotionalResponse;
  failure: EmotionalResponse;
  danger: EmotionalResponse;
  loss: EmotionalResponse;
  success: EmotionalResponse;
}

export interface ExampleDialogue {
  id: string;
  situation: string;
  userInput: string;
  expectedResponse: string;
}

export interface CanonSource {
  id: string;
  type: "Movie" | "TV Series" | "Book" | "Comic" | "Game" | "Reference Notes" | "";
  title: string;
  description: string;
}

export interface MemoryRules {
  enabled: boolean;
  rememberUserPreferences: boolean;
  rememberConversations: boolean;
  longTermEnabled: boolean;
  importanceThreshold: number;
  memoryRetentionRules: string[];
}

export interface RecommendedSettings {
  temperature?: number;
  topP?: number;
}

export interface ModelPreferences {
  preferredFamily: string | null;
  minContextLength?: number;
  recommendedSettings?: RecommendedSettings;
}

export const CURRENT_SCHEMA_VERSION = "recipe-v2";

export interface RecipeCompletenessScore {
  identity: number;
  appearance: number;
  personality: number;
  speech: number;
  values: number;
  goals: number;
  behavior: number;
  restrictions: number;
  knowledge: number;
  relationships: number;
  emotions: number;
  examples: number;
  sources: number;
  memory: number;
  overall: number;
}

export interface AppearanceProfile {
  description: string;
  distinguishingFeatures: string[];
}

export interface ResearchProfile {
  notes: string;
}

export interface SourceReference {
  id: string;
  type: string;
  title: string;
  url: string;
  notes: string;
}

export interface EvidenceEntry {
  id: string;
  title: string;
  sourceType: "Movie" | "TV" | "Book" | "Comic" | "Game" | "Interview" | "Other" | "";
  sourceName: string;
  timestamp: string;
  quote: string;
  notes: string;
  confidence: "Low" | "Medium" | "High" | "";
  supports: {
    identity: boolean;
    appearance: boolean;
    personality: boolean;
    speech: boolean;
    values: boolean;
    goals: boolean;
    behavior: boolean;
    restrictions: boolean;
    knowledge: boolean;
    relationships: boolean;
    emotions: boolean;
  };
}

export interface EvidenceCoverage {
  categoriesSupported: number;
  evidenceCount: number;
  coverage: number;
  identity: number;
  appearance: number;
  personality: number;
  speech: number;
  values: number;
  goals: number;
  behavior: number;
  restrictions: number;
  knowledge: number;
  relationships: number;
  emotions: number;
}

export interface CharacterRecipe {
  schema: string;
  version: string;
  identity: Identity;
  appearance: AppearanceProfile;
  personality: PersonalityProfile;
  speech: SpeechProfile;
  coreValues: CoreValue[];
  goals: Goals;
  behavior: BehaviorRules;
  restrictions: Restrictions;
  knowledge: KnowledgeProfile;
  relationships: Relationship[];
  emotions: EmotionalResponses;
  examples: ExampleDialogue[];
  sources: CanonSource[];
  memory: MemoryRules;
  modelPreferences: ModelPreferences;
  research: ResearchProfile;
  researchSources: SourceReference[];
  evidence: EvidenceEntry[];
}

export interface RecipeRecord {
  id: string;
  name: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export function createEmptyRecipe(): CharacterRecipe {
  return {
    schema: CURRENT_SCHEMA_VERSION,
    version: "1.0.0",
    identity: {
      name: "",
      avatar: null,
      description: "",
      category: "",
      sourceType: "",
      sourceMaterial: null,
      tags: [],
      alias: "",
      franchise: "",
      universe: "",
      version: "",
      age: "",
      occupation: "",
      species: "",
      location: ""
    },
    appearance: {
      description: "",
      distinguishingFeatures: []
    },
    personality: {
      introversion: 50,
      extroversion: 50,
      patience: 50,
      aggression: 50,
      humor: 50,
      empathy: 50,
      curiosity: 50,
      confidence: 50,
      optimism: 50,
      emotionalStability: 50,
      configuredTraits: []
    },
    speech: {
      tone: "",
      vocabulary: "",
      responseLength: "",
      usesSlang: false,
      usesHumor: false,
      usesProfanity: false,
      usesCatchphrases: false,
      catchphraseList: []
    },
    coreValues: [],
    goals: { primary: "", secondary: "", longTerm: "", shortTerm: "" },
    behavior: { always: [], never: [], usually: [], avoid: [] },
    restrictions: { hard: [], soft: [] },
    knowledge: { knownTopics: [], unknownTopics: [], expertTopics: [], forbiddenTopics: [], references: [] },
    relationships: [],
    emotions: {
      praise: { description: "", exampleDialogue: "" },
      criticism: { description: "", exampleDialogue: "" },
      failure: { description: "", exampleDialogue: "" },
      danger: { description: "", exampleDialogue: "" },
      loss: { description: "", exampleDialogue: "" },
      success: { description: "", exampleDialogue: "" }
    },
    examples: [],
    sources: [],
    memory: {
      enabled: false,
      rememberUserPreferences: false,
      rememberConversations: false,
      longTermEnabled: false,
      importanceThreshold: 50,
      memoryRetentionRules: []
    },
    modelPreferences: { preferredFamily: null },
    research: { notes: "" },
    researchSources: [],
    evidence: []
  };
}
