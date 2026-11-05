import { useRecipeStore } from "../../store/useRecipeStore";

export function AppearanceSection() {
  const { activeRecipe, updateAppearance } = useRecipeStore();
  if (!activeRecipe) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea rows={3} value={activeRecipe.appearance.description} onChange={(e) => updateAppearance({ description: e.target.value })} className="w-full px-4 py-2 border rounded-md" placeholder="General physical appearance..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Distinguishing Features (comma separated)</label>
        <textarea rows={2} value={activeRecipe.appearance.distinguishingFeatures.join(', ')} onChange={(e) => updateAppearance({ distinguishingFeatures: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full px-4 py-2 border rounded-md" placeholder="Scars, tattoos, iconic clothing..." />
      </div>
    </div>
  );
}
