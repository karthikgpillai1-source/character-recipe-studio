import { useRecipeStore } from "../../store/useRecipeStore";

export function MemorySection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const updateMem = (key: keyof typeof activeRecipe.memory, val: any) => {
    updateSection("memory", { ...activeRecipe.memory, [key]: val });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        {["enabled", "rememberUserPreferences", "rememberConversations", "longTermEnabled"].map(key => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={activeRecipe.memory[key as keyof typeof activeRecipe.memory] as boolean} onChange={(e) => updateMem(key as any, e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
          </label>
        ))}
      </div>
      <div>
        <label className="flex justify-between text-sm font-medium mb-1"><span>Importance Threshold (0-100)</span><span>{activeRecipe.memory.importanceThreshold}</span></label>
        <input type="range" min="0" max="100" value={activeRecipe.memory.importanceThreshold} onChange={(e) => updateMem("importanceThreshold", parseInt(e.target.value))} className="w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Memory Retention Rules (comma separated)</label>
        <textarea rows={3} value={activeRecipe.memory.memoryRetentionRules.join(', ')} onChange={(e) => updateMem("memoryRetentionRules", e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} className="w-full px-4 py-2 border rounded-md" placeholder="e.g. Never forget a promise, Discard idle chat..." />
      </div>
    </div>
  );
}
