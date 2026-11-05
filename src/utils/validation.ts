import { CharacterRecipe, RecipeCompletenessScore, EvidenceCoverage } from "../types/recipe";

export type ValidationLevel = "error" | "warning" | "info";
export type ValidationStatus = "success" | "warning" | "error";

export interface ValidationResultItem {
  id: string;
  label: string;
  passed: boolean;
  level: ValidationLevel;
}

export interface ValidationResult {
  rules: ValidationResultItem[];
  overallStatus: ValidationStatus;
  completenessScore: RecipeCompletenessScore;
  recreationReadiness: number;
  exampleCoverage: string;
  recipeStatus: string;
  evidenceCoverage: EvidenceCoverage;
  traceabilityScore: number;
}

type RuleEvaluator = (recipe: CharacterRecipe) => boolean;

export interface RegisteredRule {
  id: string;
  label: string;
  level: ValidationLevel;
  evaluate: RuleEvaluator;
}

const ruleRegistry: RegisteredRule[] = [
  // Identity
  { id: "schema", label: "Schema Version Check", level: "error", evaluate: (r) => !!r.schema },
  { id: "name", label: "Identity Name Present", level: "error", evaluate: (r) => r.identity.name.trim().length > 0 },
  { id: "description", label: "Identity Description Present", level: "error", evaluate: (r) => r.identity.description.trim().length > 0 },
  { id: "category", label: "Category Selected", level: "warning", evaluate: (r) => r.identity.category !== "" },
  { id: "universe", label: "Universe/Franchise Defined", level: "info", evaluate: (r) => r.identity.universe.trim().length > 0 || r.identity.franchise.trim().length > 0 },
  
  // Appearance
  { id: "appearance", label: "Appearance Description", level: "info", evaluate: (r) => r.appearance?.description.trim().length > 0 },

  // Personality
  { id: "personality_configured", label: "Trait configured", level: "info", evaluate: (r) => (r.personality.configuredTraits || []).length > 0 },
  { id: "personality_default", label: "Default values detected", level: "warning", evaluate: (r) => (r.personality.configuredTraits || []).length > 0 },

  // Speech
  { id: "speech_tone", label: "Tone Selected", level: "warning", evaluate: (r) => r.speech.tone !== "" },
  { id: "speech_vocab", label: "Vocabulary Level Selected", level: "info", evaluate: (r) => r.speech.vocabulary !== "" },
  
  // Core Values
  { id: "values", label: "Core Values Defined", level: "warning", evaluate: (r) => r.coreValues.length > 0 },

  // Goals
  { id: "primary_goal", label: "Primary Goal missing", level: "error", evaluate: (r) => r.goals.primary.trim().length > 0 },
  { id: "goals_configured", label: "Goals Configured", level: "info", evaluate: (r) => r.goals.primary.trim().length > 0 },
  { id: "secondary_goals", label: "Secondary Goals Present", level: "info", evaluate: (r) => r.goals.secondary.trim().length > 0 },

  // Behavior & Restrictions
  { id: "behavior_rules", label: "Behavior Rules Defined", level: "warning", evaluate: (r) => r.behavior.always.length > 0 || r.behavior.never.length > 0 },
  { id: "hard_restrictions", label: "Hard Restrictions Defined", level: "info", evaluate: (r) => r.restrictions.hard.length > 0 },

  // Knowledge
  { id: "knowledge_configured", label: "Knowledge profile configured", level: "info", evaluate: (r) => r.knowledge.knownTopics.length > 0 || r.knowledge.expertTopics.length > 0 || r.knowledge.unknownTopics.length > 0 },
  { id: "knowledge_expert", label: "No expert topics", level: "warning", evaluate: (r) => r.knowledge.expertTopics.length > 0 },

  // Relationships
  { id: "relationships_configured", label: "Relationships configured", level: "info", evaluate: (r) => r.relationships.length > 0 },
  { id: "relationships_empty", label: "No relationships defined", level: "warning", evaluate: (r) => r.identity.category === "Original" || r.relationships.length > 0 },

  // Emotions
  { id: "emotions_configured", label: "Emotional profile configured", level: "info", evaluate: (r) => {
    return Object.values(r.emotions).some(e => e.description.trim().length > 0 || e.exampleDialogue.trim().length > 0);
  }},
  { id: "emotions_missing", label: "No emotional response definitions", level: "error", evaluate: (r) => {
    return Object.values(r.emotions).some(e => e.description.trim().length > 0 || e.exampleDialogue.trim().length > 0);
  }},
  { id: "emotions_min", label: "Less than 3 responses defined", level: "warning", evaluate: (r) => {
    return Object.values(r.emotions).filter(e => e.description.trim().length > 0 || e.exampleDialogue.trim().length > 0).length >= 3;
  }},

  // Examples
  { id: "examples_exist", label: "Examples Present", level: "error", evaluate: (r) => r.examples.length > 0 },
  { id: "examples_min", label: "Minimum 10 Examples Recommended", level: "warning", evaluate: (r) => r.examples.length >= 10 },
  
  // Sources
  { id: "sources", label: "Canon Sources Defined", level: "info", evaluate: (r) => r.sources.length > 0 },

  // Memory
  { id: "memory_configured", label: "Memory configured", level: "info", evaluate: (r) => r.memory.enabled },
  { id: "memory_rules", label: "Memory enabled without retention rules", level: "warning", evaluate: (r) => !r.memory.enabled || r.memory.memoryRetentionRules.length > 0 },

  // Evidence
  { id: "evidence_present", label: "Evidence Present", level: "info", evaluate: (r) => r.evidence.length > 0 },
  { id: "evidence_missing", label: "No Evidence Entries", level: "info", evaluate: (r) => r.evidence.length === 0 },
  { id: "evidence_limited", label: "Limited Supporting Evidence", level: "info", evaluate: (r) => r.evidence.length > 0 && r.evidence.length < 5 },
];

export function registerRule(rule: RegisteredRule) {
  const existingIndex = ruleRegistry.findIndex((r) => r.id === rule.id);
  if (existingIndex >= 0) {
    ruleRegistry[existingIndex] = rule;
  } else {
    ruleRegistry.push(rule);
  }
}

export function calculateCompletenessScore(recipe: CharacterRecipe): RecipeCompletenessScore {
  const score = {
    identity: 0, appearance: 0, personality: 0, speech: 0, values: 0, goals: 0,
    behavior: 0, restrictions: 0, knowledge: 0, relationships: 0,
    emotions: 0, examples: 0, sources: 0, memory: 0, overall: 0
  };

  let idScore = 0;
  if (recipe.identity.name) idScore += 10;
  if (recipe.identity.description) idScore += 10;
  if (recipe.identity.category) idScore += 10;
  if (recipe.identity.sourceType) idScore += 10;
  if (recipe.identity.tags.length > 0) idScore += 10;
  if (recipe.identity.alias) idScore += 10;
  if (recipe.identity.franchise) idScore += 10;
  if (recipe.identity.universe) idScore += 10;
  if (recipe.identity.age) idScore += 10;
  if (recipe.identity.occupation) idScore += 10;
  score.identity = idScore;

  if (recipe.appearance?.description) score.appearance += 50;
  if (recipe.appearance?.distinguishingFeatures?.length > 0) score.appearance += 50;

  score.personality = Math.min(100, (recipe.personality.configuredTraits || []).length * 10);

  let speechScore = 0;
  if (recipe.speech.tone) speechScore += 33;
  if (recipe.speech.vocabulary) speechScore += 33;
  if (recipe.speech.responseLength) speechScore += 34;
  score.speech = speechScore;

  score.values = recipe.coreValues.length > 0 ? 100 : 0;

  let goalsScore = 0;
  if (recipe.goals.primary) goalsScore += 40;
  if (recipe.goals.secondary) goalsScore += 20;
  if (recipe.goals.longTerm) goalsScore += 20;
  if (recipe.goals.shortTerm) goalsScore += 20;
  score.goals = goalsScore;

  let behaviorScore = 0;
  if (recipe.behavior.always.length > 0) behaviorScore += 50;
  if (recipe.behavior.never.length > 0) behaviorScore += 50;
  score.behavior = behaviorScore;

  let restrScore = 0;
  if (recipe.restrictions.hard.length > 0) restrScore += 50;
  if (recipe.restrictions.soft.length > 0) restrScore += 50;
  score.restrictions = restrScore;

  let knowledgeScore = 0;
  if (recipe.knowledge.knownTopics.length > 0) knowledgeScore += 25;
  if (recipe.knowledge.expertTopics.length > 0) knowledgeScore += 25;
  if (recipe.knowledge.unknownTopics.length > 0) knowledgeScore += 25;
  if (recipe.knowledge.forbiddenTopics.length > 0) knowledgeScore += 25;
  score.knowledge = knowledgeScore;

  if (recipe.relationships.length >= 3) score.relationships = 100;
  else if (recipe.relationships.length === 2) score.relationships = 66;
  else if (recipe.relationships.length === 1) score.relationships = 33;

  const activeEmotions = Object.values(recipe.emotions).filter(e => e.description.trim().length > 0 || e.exampleDialogue.trim().length > 0).length;
  score.emotions = Math.round(activeEmotions * 16.666);
  if (score.emotions > 100) score.emotions = 100;

  score.examples = Math.min(100, recipe.examples.length * 10);

  if (recipe.sources.length >= 2) score.sources = 100;
  else if (recipe.sources.length === 1) score.sources = 50;

  let memScore = 0;
  if (recipe.memory.enabled) memScore += 20;
  if (recipe.memory.importanceThreshold !== 50) memScore += 20;
  if (recipe.memory.memoryRetentionRules.length > 0) memScore += 60;
  score.memory = memScore;

  score.overall = Math.round(
    (score.identity + score.appearance + score.personality + score.speech + score.values + score.goals + score.behavior + score.restrictions + score.knowledge + score.relationships + score.emotions + score.examples + score.sources + score.memory) / 14
  );

  return score;
}

export function calculateEvidenceCoverage(recipe: CharacterRecipe) {
  const supports = {
    identity: 0,
    appearance: 0,
    personality: 0,
    speech: 0,
    values: 0,
    goals: 0,
    behavior: 0,
    restrictions: 0,
    knowledge: 0,
    relationships: 0,
    emotions: 0
  };
  
  for (const entry of recipe.evidence) {
    if (entry.supports.identity) supports.identity++;
    if (entry.supports.appearance) supports.appearance++;
    if (entry.supports.personality) supports.personality++;
    if (entry.supports.speech) supports.speech++;
    if (entry.supports.values) supports.values++;
    if (entry.supports.goals) supports.goals++;
    if (entry.supports.behavior) supports.behavior++;
    if (entry.supports.restrictions) supports.restrictions++;
    if (entry.supports.knowledge) supports.knowledge++;
    if (entry.supports.relationships) supports.relationships++;
    if (entry.supports.emotions) supports.emotions++;
  }

  const coveragePct = (count: number) => {
    if (count >= 4) return 100;
    if (count === 3) return 75;
    if (count === 2) return 50;
    if (count === 1) return 25;
    return 0;
  };

  const identity = coveragePct(supports.identity);
  const appearance = coveragePct(supports.appearance);
  const personality = coveragePct(supports.personality);
  const speech = coveragePct(supports.speech);
  const values = coveragePct(supports.values);
  const goals = coveragePct(supports.goals);
  const behavior = coveragePct(supports.behavior);
  const restrictions = coveragePct(supports.restrictions);
  const knowledge = coveragePct(supports.knowledge);
  const relationships = coveragePct(supports.relationships);
  const emotions = coveragePct(supports.emotions);

  const categoriesSupported = [identity, appearance, personality, speech, values, goals, behavior, restrictions, knowledge, relationships, emotions].filter(c => c > 0).length;
  const overallCoverage = Math.round((identity + appearance + personality + speech + values + goals + behavior + restrictions + knowledge + relationships + emotions) / 11);

  return {
    categoriesSupported,
    evidenceCount: recipe.evidence.length,
    coverage: overallCoverage,
    identity,
    appearance,
    personality,
    speech,
    values,
    goals,
    behavior,
    restrictions,
    knowledge,
    relationships,
    emotions
  };
}

export function validateRecipe(recipe: CharacterRecipe): ValidationResult {
  const rules: ValidationResultItem[] = ruleRegistry.map((rule) => ({
    id: rule.id,
    label: rule.label,
    level: rule.level,
    passed: rule.evaluate(recipe),
  }));

  const hasErrors = rules.some((r) => r.level === "error" && !r.passed);
  const hasWarnings = rules.some((r) => r.level === "warning" && !r.passed);

  let overallStatus: ValidationStatus = "success";
  if (hasErrors) {
    overallStatus = "error";
  } else if (hasWarnings) {
    overallStatus = "warning";
  }

  const completenessScore = calculateCompletenessScore(recipe);

  // Status computation
  let recipeStatus = "Container Created";
  if (completenessScore.overall > 90) recipeStatus = "Ready For Export";
  else if (completenessScore.overall > 70) recipeStatus = "Near Complete";
  else if (completenessScore.overall > 40) recipeStatus = "Partially Defined";
  else if (completenessScore.overall > 10) recipeStatus = "Definition In Progress";

  // Example coverage computation
  let exampleCoverage = "Critical";
  if (recipe.examples.length >= 10) exampleCoverage = "Excellent";
  else if (recipe.examples.length >= 8) exampleCoverage = "Good";
  else if (recipe.examples.length >= 4) exampleCoverage = "Moderate";
  else if (recipe.examples.length >= 1) exampleCoverage = "Poor";

  // Recreation readiness computation
  // Weights: Identity 15%, Personality 15%, Speech 15%, Behavior 15%, Restrictions 10%, Examples 20%, Sources 10%
  const recreationReadiness = Math.round(
    (completenessScore.identity * 0.15) +
    (completenessScore.personality * 0.15) +
    (completenessScore.speech * 0.15) +
    (completenessScore.behavior * 0.15) +
    (completenessScore.restrictions * 0.10) +
    (completenessScore.examples * 0.20) +
    (completenessScore.sources * 0.10)
  );

  const evidenceCoverage = calculateEvidenceCoverage(recipe);

  // Traceability Score = average of: Has Research Notes (100 or 0), Has Sources (100 or 0), Evidence Coverage (0-100), Recipe Completeness
  const hasResearch = recipe.research.notes.trim().length > 0 ? 100 : 0;
  const hasSources = recipe.researchSources.length > 0 ? 100 : 0;
  const sectionsComplete = (Object.values(completenessScore).filter((v, i, a) => v > 0 && i !== a.length - 1).length / 14) * 100;
  
  const traceabilityScore = Math.round((hasResearch + hasSources + evidenceCoverage.coverage + sectionsComplete) / 4);

  return { 
    rules, 
    overallStatus, 
    completenessScore,
    recreationReadiness,
    exampleCoverage,
    recipeStatus,
    evidenceCoverage,
    traceabilityScore
  };
}
