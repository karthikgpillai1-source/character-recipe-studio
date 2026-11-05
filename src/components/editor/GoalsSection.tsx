import { useRecipeStore } from "../../store/useRecipeStore";

export function GoalsSection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const updateGoal = (key: keyof typeof activeRecipe.goals, val: string) => {
    updateSection("goals", { ...activeRecipe.goals, [key]: val });
  };

  return (
    <div className="space-y-4">
      {Object.keys(activeRecipe.goals).map((key) => (
        <div key={key}>
          <label className="block text-sm font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()} Goal</label>
          <textarea rows={2} value={activeRecipe.goals[key as keyof typeof activeRecipe.goals]} onChange={(e) => updateGoal(key as keyof typeof activeRecipe.goals, e.target.value)} className="w-full px-4 py-2 border rounded-md" />
        </div>
      ))}
    </div>
  );
}
