import { useRecipeStore } from "../../store/useRecipeStore";
import { Plus, Trash2 } from "lucide-react";

export function SourcesSection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const addSource = () => {
    updateSection("sources", [...activeRecipe.sources, { id: crypto.randomUUID(), type: "", title: "", description: "" }]);
  };

  const removeSource = (id: string) => {
    updateSection("sources", activeRecipe.sources.filter(s => s.id !== id));
  };

  const updateSource = (id: string, field: string, value: any) => {
    updateSection("sources", activeRecipe.sources.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="space-y-4">
      {activeRecipe.sources.map((src) => (
        <div key={src.id} className="p-4 border rounded-md relative bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <button onClick={() => removeSource(src.id)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={src.type} onChange={(e) => updateSource(src.id, "type", e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option value="" disabled>Select Type</option>
                {["Movie", "TV Series", "Book", "Comic", "Game", "Reference Notes"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={src.title} onChange={(e) => updateSource(src.id, "title", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description / Notes</label><textarea rows={2} value={src.description} onChange={(e) => updateSource(src.id, "description", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
          </div>
        </div>
      ))}
      <button onClick={addSource} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium rounded-md w-full justify-center">
        <Plus className="w-4 h-4" /> Add Canon Source
      </button>
    </div>
  );
}
