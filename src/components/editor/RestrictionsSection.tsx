import { useRecipeStore } from "../../store/useRecipeStore";

export function RestrictionsSection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const updateRestr = (key: keyof typeof activeRecipe.restrictions, val: string) => {
    updateSection("restrictions", { ...activeRecipe.restrictions, [key]: val.split(',').map(s=>s.trim()).filter(Boolean) });
  };

  return (
    <div className="space-y-4">
      {["hard", "soft"].map(key => (
        <div key={key}>
          <label className="block text-sm font-medium capitalize mb-1">{key} Restrictions (comma separated)</label>
          <textarea rows={2} value={activeRecipe.restrictions[key as keyof typeof activeRecipe.restrictions].join(', ')} onChange={(e) => updateRestr(key as keyof typeof activeRecipe.restrictions, e.target.value)} className="w-full px-4 py-2 border rounded-md" />
        </div>
      ))}
    </div>
  );
}
