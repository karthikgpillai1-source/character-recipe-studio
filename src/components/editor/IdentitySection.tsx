import { useState } from "react";
import { useRecipeStore } from "../../store/useRecipeStore";
import { Category, SourceType } from "../../types/recipe";
import { X } from "lucide-react";

const CATEGORIES: Category[] = ["Fictional", "Historical", "Original", "Assistant", "Other"];
const SOURCE_TYPES: SourceType[] = ["Movie", "TV", "Anime", "Game", "Book", "Comic", "Manga", "Web Series", "Real World", "Custom"];

export function IdentitySection() {
  const { activeRecipe, updateIdentity } = useRecipeStore();
  const [tagInput, setTagInput] = useState("");
  if (!activeRecipe) return null;

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const existing = activeRecipe.identity.tags.map(t => t.toLowerCase());
    if (!existing.includes(lower)) {
      updateIdentity({ tags: [...activeRecipe.identity.tags, trimmed] });
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateIdentity({ tags: activeRecipe.identity.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Character Name</label><input type="text" value={activeRecipe.identity.name} onChange={(e) => updateIdentity({ name: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Alias</label><input type="text" value={activeRecipe.identity.alias} onChange={(e) => updateIdentity({ alias: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Franchise</label><input type="text" value={activeRecipe.identity.franchise} onChange={(e) => updateIdentity({ franchise: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Universe</label><input type="text" value={activeRecipe.identity.universe} onChange={(e) => updateIdentity({ universe: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Version</label><input type="text" value={activeRecipe.identity.version} onChange={(e) => updateIdentity({ version: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Age</label><input type="text" value={activeRecipe.identity.age} onChange={(e) => updateIdentity({ age: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Occupation</label><input type="text" value={activeRecipe.identity.occupation} onChange={(e) => updateIdentity({ occupation: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div><label className="block text-sm font-medium mb-1">Species</label><input type="text" value={activeRecipe.identity.species} onChange={(e) => updateIdentity({ species: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={activeRecipe.identity.category} onChange={(e) => updateIdentity({ category: e.target.value as Category })} className="w-full px-4 py-2 border rounded-md"><option value="" disabled>Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Source Type</label>
          <select value={activeRecipe.identity.sourceType} onChange={(e) => updateIdentity({ sourceType: e.target.value as SourceType })} className="w-full px-4 py-2 border rounded-md"><option value="" disabled>Select source type</option>{SOURCE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
      </div>
      <div className="mt-4"><label className="block text-sm font-medium mb-1">Description</label><textarea rows={3} value={activeRecipe.identity.description} onChange={(e) => updateIdentity({ description: e.target.value })} className="w-full px-4 py-2 border rounded-md" /></div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex gap-2 mb-2">
          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="flex-1 px-4 py-2 border rounded-md" placeholder="e.g. superhero, billionaire, detective" />
          <button onClick={addTag} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium rounded-md">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeRecipe.identity.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-md">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
