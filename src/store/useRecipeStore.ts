import { create } from "zustand";
import { CharacterRecipe, RecipeRecord } from "../types/recipe";
import { validateRecipe, ValidationResult } from "../utils/validation";

interface RecipeStore {
  activeRecord: RecipeRecord | null;
  activeRecipe: CharacterRecipe | null;
  saveStatus: "Saved" | "Saving..." | "Unsaved Changes";
  
  // Actions
  setRecipe: (record: RecipeRecord, recipe: CharacterRecipe) => void;
  loadRecipe: (record: RecipeRecord, recipe: CharacterRecipe) => void;
  updateIdentity: (updates: Partial<CharacterRecipe["identity"]>) => void;
  updateAppearance: (updates: Partial<CharacterRecipe["appearance"]>) => void;
  updatePersonality: (updates: Partial<CharacterRecipe["personality"]>) => void;
  updateSpeech: (updates: Partial<CharacterRecipe["speech"]>) => void;
  updateBehavior: (updates: Partial<CharacterRecipe["behavior"]>) => void;
  updateKnowledge: (updates: Partial<CharacterRecipe["knowledge"]>) => void;
  updateResearch: (updates: Partial<CharacterRecipe["research"]>) => void;
  updateEvidence: (evidence: CharacterRecipe["evidence"]) => void;
  updateResearchSources: (sources: CharacterRecipe["researchSources"]) => void;
  
  // Generic update for replacing full sections like lists
  updateSection: <K extends keyof CharacterRecipe>(section: K, data: CharacterRecipe[K]) => void;

  setSaveStatus: (status: RecipeStore["saveStatus"]) => void;
  
  // Derived state (getters)
  getValidation: () => ValidationResult;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  activeRecord: null,
  activeRecipe: null,
  saveStatus: "Saved",

  setRecipe: (record, recipe) => {
    set({ activeRecord: record, activeRecipe: recipe, saveStatus: "Saved" });
  },

  loadRecipe: (record, recipe) => {
    set({ activeRecord: record, activeRecipe: recipe, saveStatus: "Saved" });
  },

  updateIdentity: (updates) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          identity: {
            ...state.activeRecipe.identity,
            ...updates,
          },
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateAppearance: (updates) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          appearance: {
            ...state.activeRecipe.appearance,
            ...updates,
          },
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updatePersonality: (updates) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          personality: {
            ...state.activeRecipe.personality,
            ...updates,
          },
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateSpeech: (updates) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          speech: {
            ...state.activeRecipe.speech,
            ...updates,
          },
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateBehavior: (updates) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          behavior: {
            ...state.activeRecipe.behavior,
            ...updates,
          },
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateKnowledge: (updates) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          knowledge: {
            ...state.activeRecipe.knowledge,
            ...updates,
          },
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateResearch: (updates) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          research: {
            ...state.activeRecipe.research,
            ...updates,
          },
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateEvidence: (evidence) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          evidence,
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateResearchSources: (researchSources) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          researchSources,
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  updateSection: (section, data) => {
    set((state) => {
      if (!state.activeRecipe) return state;
      return {
        activeRecipe: {
          ...state.activeRecipe,
          [section]: data,
        },
        saveStatus: "Unsaved Changes",
      };
    });
  },

  setSaveStatus: (status) => set({ saveStatus: status }),

  getValidation: () => {
    const { activeRecipe } = get();
    if (!activeRecipe) {
      return { 
        rules: [], 
        overallStatus: "error" as const, 
        completenessScore: {
          identity: 0, appearance: 0, personality: 0, speech: 0, values: 0, goals: 0,
          behavior: 0, restrictions: 0, knowledge: 0, relationships: 0,
          emotions: 0, examples: 0, sources: 0, memory: 0, overall: 0
        },
        recreationReadiness: 0,
        exampleCoverage: "Critical",
        recipeStatus: "Container Created",
        evidenceCoverage: {
          categoriesSupported: 0,
          evidenceCount: 0,
          coverage: 0,
          identity: 0, appearance: 0, personality: 0, speech: 0, values: 0, goals: 0,
          behavior: 0, restrictions: 0, knowledge: 0, relationships: 0, emotions: 0
        },
        traceabilityScore: 0
      };
    }

    return validateRecipe(activeRecipe);
  },
}));
