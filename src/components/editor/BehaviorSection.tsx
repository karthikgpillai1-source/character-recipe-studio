import { useRecipeStore } from "../../store/useRecipeStore";

export function BehaviorSection() {
  const { activeRecipe, updateBehavior } = useRecipeStore();
  if (!activeRecipe) return null;

  return (
    <div className="space-y-4">
      {["always", "never", "usually", "avoid"].map(key => (
        <div key={key}>
          <label className="block text-sm font-medium capitalize mb-1">{key} Do (comma separated)</label>
          <textarea rows={2} value={activeRecipe.behavior[key as keyof typeof activeRecipe.behavior].join(', ')} onChange={(e) => updateBehavior({ [key]: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full px-4 py-2 border rounded-md" />
        </div>
      ))}
    </div>
  );
}
