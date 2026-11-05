import { useRecipeStore } from "../../store/useRecipeStore";
import { Plus, Trash2 } from "lucide-react";

export function RelationshipsSection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const addRel = () => {
    updateSection("relationships", [...activeRecipe.relationships, { id: crypto.randomUUID(), name: "", type: "", trustLevel: 50, description: "" }]);
  };

  const removeRel = (id: string) => {
    updateSection("relationships", activeRecipe.relationships.filter(r => r.id !== id));
  };

  const updateRel = (id: string, field: string, value: any) => {
    updateSection("relationships", activeRecipe.relationships.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-4">
      {activeRecipe.relationships.map((rel) => (
        <div key={rel.id} className="p-4 border rounded-md relative bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <button onClick={() => removeRel(rel.id)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={rel.name} onChange={(e) => updateRel(rel.id, "name", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium mb-1">Type (e.g. Mentor, Enemy)</label><input type="text" value={rel.type} onChange={(e) => updateRel(rel.id, "type", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
            <div className="col-span-2">
              <label className="flex justify-between text-sm font-medium mb-1"><span>Trust Level</span><span>{rel.trustLevel}</span></label>
              <input type="range" min="0" max="100" value={rel.trustLevel} onChange={(e) => updateRel(rel.id, "trustLevel", parseInt(e.target.value))} className="w-full" />
            </div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea rows={2} value={rel.description} onChange={(e) => updateRel(rel.id, "description", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
          </div>
        </div>
      ))}
      <button onClick={addRel} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium rounded-md w-full justify-center">
        <Plus className="w-4 h-4" /> Add Relationship
      </button>
    </div>
  );
}
