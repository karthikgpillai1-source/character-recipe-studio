import { useRecipeStore } from "../../store/useRecipeStore";
import { Plus, Trash2 } from "lucide-react";

export function ValuesSection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const addValue = () => {
    updateSection("coreValues", [...activeRecipe.coreValues, { id: crypto.randomUUID(), importance: 50, description: "" }]);
  };

  const removeValue = (id: string) => {
    updateSection("coreValues", activeRecipe.coreValues.filter(v => v.id !== id));
  };

  const updateValue = (id: string, field: string, value: any) => {
    updateSection("coreValues", activeRecipe.coreValues.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  return (
    <div className="space-y-4">
      {activeRecipe.coreValues.map((val, index) => (
        <div key={val.id} className="p-4 border rounded-md relative bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <button onClick={() => removeValue(val.id)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Value {index + 1} Description</label>
              <input type="text" value={val.description} onChange={(e) => updateValue(val.id, "description", e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Justice, Loyalty..." />
            </div>
            <div className="col-span-2">
              <label className="flex justify-between text-sm font-medium mb-1"><span>Importance</span><span>{val.importance}</span></label>
              <input type="range" min="0" max="100" value={val.importance} onChange={(e) => updateValue(val.id, "importance", parseInt(e.target.value))} className="w-full" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addValue} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium rounded-md w-full justify-center">
        <Plus className="w-4 h-4" /> Add Core Value
      </button>
    </div>
  );
}
