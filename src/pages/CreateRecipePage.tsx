import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useRecipeStore } from "../store/useRecipeStore";
import { CharacterRecipe, Category, SourceType, RecipeRecord, createEmptyRecipe } from "../types/recipe";
import { Info } from "lucide-react";

const CATEGORIES: Category[] = ["Fictional", "Historical", "Original", "Assistant", "Other"];
const SOURCE_TYPES: SourceType[] = [
  "Movie", "TV", "Anime", "Game", "Book", "Comic", "Manga", "Web Series", "Real World", "Custom",
];

const SECTIONS = ["Identity", "Appearance", "Personality", "Speech", "Values", "Goals", "Behavior", "Restrictions", "Knowledge", "Relationships", "Emotions", "Examples", "Sources", "Memory Rules"];

export function CreateRecipePage() {
  const navigate = useNavigate();
  const setRecipe = useRecipeStore((state) => state.setRecipe);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [sourceType, setSourceType] = useState<SourceType | "">("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const newRecipe: CharacterRecipe = {
      ...createEmptyRecipe(),
      identity: {
        ...createEmptyRecipe().identity,
        name,
        description,
        category,
        sourceType,
      },
    };

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const record: RecipeRecord = {
      id,
      name: newRecipe.identity.name,
      data: JSON.stringify(newRecipe),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await invoke("save_recipe", { record });
      setRecipe(record, newRecipe);
      navigate(`/editor/${id}?new=true`);
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex gap-8 items-start">
      <div className="flex-1">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Initialize Recipe Container
          </h2>
          <p className="text-neutral-500 mt-2">
            Setup the workspace for your new character.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5 mb-8">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-2">Character Recipe Studio uses a structured recipe system.</p>
              <p className="mb-4 text-blue-800 dark:text-blue-200">
                This step creates a recipe container only. A character recipe is a complete behavioral specification, not a brief.
                Character recreation quality comes from the sections completed inside the Recipe Editor.
              </p>
              <p className="font-semibold mb-2">Core Workflow:</p>
              <p className="mb-4 text-blue-800 dark:text-blue-200">
                Research → Evidence → Recipe → Audit → Export
              </p>
              <p className="font-semibold mb-2">After creating the container, you will configure:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SECTIONS.map(s => <div key={s} className="flex items-center gap-1.5 opacity-80">• {s}</div>)}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Character Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="e.g. Sherlock Holmes"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="A brief overview of who this character is..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="sourceType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Source Type
              </label>
              <select
                id="sourceType"
                required
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              >
                <option value="" disabled>Select a source</option>
                {SOURCE_TYPES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm"
            >
              Create Recipe & Open Editor
            </button>
          </div>
        </form>
      </div>

      <aside className="w-64 shrink-0 mt-8">
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Recipe Completeness</h3>
          <div className="space-y-3">
            {SECTIONS.map(s => (
              <div key={s} className="flex justify-between items-center text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">{s}</span>
                <span className="text-neutral-400 font-medium">0%</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
