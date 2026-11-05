import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { useRecipeStore } from "../store/useRecipeStore";
import { useSettingsStore, SortOption } from "../store/useSettingsStore";
import { RecipeRecord, CharacterRecipe, Category, createEmptyRecipe } from "../types/recipe";
import { validateRecipe, ValidationStatus } from "../utils/validation";
import { Search, PlusCircle, FolderOpen, CheckCircle2, AlertTriangle, XCircle, Import, Trash2 } from "lucide-react";

interface LibraryEntry {
  record: RecipeRecord;
  recipe: CharacterRecipe;
  validationStatus: ValidationStatus;
}

type SortOptionLocal = SortOption;

export function LibraryPage() {
  const navigate = useNavigate();
  const loadRecipe = useRecipeStore((state) => state.loadRecipe);
  const defaultSortSetting = useSettingsStore((state) => state.defaultSort);

  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [validationFilter, setValidationFilter] = useState<ValidationStatus | "All">("All");
  const [sortBy, setSortBy] = useState<SortOptionLocal>(defaultSortSetting);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const records: RecipeRecord[] = await invoke("get_recipes");
        const parsedEntries: LibraryEntry[] = records.map((record) => {
          let recipe: CharacterRecipe;
          try {
            recipe = JSON.parse(record.data);
          } catch (e) {
            // Fallback for corrupted data
            recipe = createEmptyRecipe();
            recipe.identity.name = record.name;
          }
          const validation = validateRecipe(recipe);
          return {
            record,
            recipe,
            validationStatus: validation.overallStatus
          };
        });
        setEntries(parsedEntries);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  const filteredAndSortedEntries = useMemo(() => {
    let result = entries;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((entry) => {
        const { name, description, tags, alias, franchise, universe } = entry.recipe.identity;
        return (
          name.toLowerCase().includes(q) ||
          alias.toLowerCase().includes(q) ||
          franchise.toLowerCase().includes(q) ||
          universe.toLowerCase().includes(q) ||
          description.toLowerCase().includes(q) ||
          tags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
    }

    // Category Filter
    if (categoryFilter !== "All") {
      result = result.filter((entry) => entry.recipe.identity.category === categoryFilter);
    }

    // Validation Filter
    if (validationFilter !== "All") {
      result = result.filter((entry) => entry.validationStatus === validationFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "Name") {
        return a.record.name.localeCompare(b.record.name);
      } else if (sortBy === "Created Date") {
        return new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime();
      } else {
        // Last Modified
        return new Date(b.record.updatedAt).getTime() - new Date(a.record.updatedAt).getTime();
      }
    });

    return result;
  }, [entries, searchQuery, categoryFilter, validationFilter, sortBy]);

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEntryId) return;
      
      const entry = filteredAndSortedEntries.find(entry => entry.record.id === selectedEntryId);
      if (!entry) return;

      if (e.key === "Enter") {
        handleOpen(entry);
      } else if (e.key === "Delete") {
        if (window.confirm(`Are you sure you want to delete "${entry.recipe.identity.name}"?`)) {
          invoke("delete_recipe", { id: entry.record.id }).then(() => {
            setEntries(entries.filter((e) => e.record.id !== entry.record.id));
            setSelectedEntryId(null);
          }).catch(err => console.error("Failed to delete recipe:", err));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEntryId, filteredAndSortedEntries, entries]);

  const handleOpen = (entry: LibraryEntry) => {
    loadRecipe(entry.record, entry.recipe);
    navigate(`/editor/${entry.record.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, entry: LibraryEntry) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${entry.recipe.identity.name}"?`)) {
      try {
        await invoke("delete_recipe", { id: entry.record.id });
        setEntries(entries.filter((e) => e.record.id !== entry.record.id));
        if (selectedEntryId === entry.record.id) setSelectedEntryId(null);
      } catch (err) {
        console.error("Failed to delete recipe:", err);
      }
    }
  };

  const renderValidationBadge = (status: ValidationStatus) => {
    if (status === "success") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" /> Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="w-3.5 h-3.5" /> Invalid
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex-none px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            Recipes <span className="text-neutral-400 dark:text-neutral-500 font-normal text-lg">({entries.length})</span>
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/import")}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Import Recipe"
            >
              <Import className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={() => navigate("/create")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="New Recipe"
            >
              <PlusCircle className="w-4 h-4" />
              New Recipe
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Categories</option>
              <option value="Fictional">Fictional</option>
              <option value="Historical">Historical</option>
              <option value="Original">Original</option>
              <option value="Assistant">Assistant</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={validationFilter}
              onChange={(e) => setValidationFilter(e.target.value as any)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Statuses</option>
              <option value="success">Valid</option>
              <option value="warning">Warning</option>
              <option value="error">Invalid</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOptionLocal)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Sort by"
            >
              <option value="Last Modified">Last Modified</option>
              <option value="Created Date">Created Date</option>
              <option value="Name">Name</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-3">
          {loading ? (
            <p className="text-neutral-500 text-center py-12">Loading library...</p>
          ) : filteredAndSortedEntries.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <FolderOpen className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">No recipes found</h3>
              <p className="text-neutral-500 mt-1">Try adjusting your search or filters, or create a new recipe.</p>
            </div>
          ) : (
            filteredAndSortedEntries.map((entry) => (
              <div 
                key={entry.record.id}
                onClick={() => setSelectedEntryId(entry.record.id)}
                onDoubleClick={() => handleOpen(entry)}
                className={`group flex items-center justify-between p-4 border rounded-lg transition-colors shadow-sm cursor-pointer ${
                  selectedEntryId === entry.record.id 
                    ? "bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-600" 
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">
                      {entry.recipe.identity.name || "Untitled Recipe"}
                    </h3>
                    {renderValidationBadge(entry.validationStatus)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{entry.recipe.identity.category || "Uncategorized"}</span>
                    <span>&bull;</span>
                    <span>{entry.recipe.identity.sourceType || "No Source"}</span>
                    <span>&bull;</span>
                    <span>Updated {new Date(entry.record.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(e, entry)}
                    className="px-3 py-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(entry);
                    }}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-50 text-sm font-medium rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
