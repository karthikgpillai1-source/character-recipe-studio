import { CharacterRecipe, createEmptyRecipe } from "../types/recipe";

/**
 * Migrates older recipe formats to the latest v1.1.0 format
 * ensuring older recipes never break.
 */
export function migrateRecipe(parsedData: any): CharacterRecipe {
  const emptyRecipe = createEmptyRecipe();

  // If it's just missing some keys but has the basic structure, we merge it
  const migrated: CharacterRecipe = {
    ...emptyRecipe,
    ...parsedData,
    identity: {
      ...emptyRecipe.identity,
      ...(parsedData.identity || {})
    },
    appearance: {
      ...emptyRecipe.appearance,
      ...(parsedData.appearance || {})
    },
    personality: {
      ...emptyRecipe.personality,
      ...(parsedData.personality || {})
    },
    speech: {
      ...emptyRecipe.speech,
      ...(parsedData.speech || {})
    },
    goals: {
      ...emptyRecipe.goals,
      ...(parsedData.goals || {})
    },
    behavior: {
      ...emptyRecipe.behavior,
      ...(parsedData.behavior || {})
    },
    restrictions: {
      ...emptyRecipe.restrictions,
      ...(parsedData.restrictions || {})
    },
    knowledge: {
      ...emptyRecipe.knowledge,
      ...(parsedData.knowledge || {})
    },
    emotions: {
      ...emptyRecipe.emotions,
      ...(parsedData.emotions || {})
    },
    memory: {
      ...emptyRecipe.memory,
      ...(parsedData.memory || {})
    },
    modelPreferences: {
      ...emptyRecipe.modelPreferences,
      ...(parsedData.modelPreferences || {})
    },
    research: {
      ...emptyRecipe.research,
      ...(parsedData.research || {})
    }
  };

  // v1.1.0 introduced schema and version
  migrated.schema = "recipe-v2";
  migrated.version = "1.1.0";

  // v1.1.0 introduced evidence and researchSources arrays
  if (!migrated.evidence) migrated.evidence = [];
  if (!migrated.researchSources) migrated.researchSources = [];

  return migrated;
}
