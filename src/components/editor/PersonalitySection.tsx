import { useRecipeStore } from "../../store/useRecipeStore";

export function PersonalitySection() {
  const { activeRecipe, updatePersonality } = useRecipeStore();
  if (!activeRecipe) return null;

  const handleUpdate = (key: string, value: number) => {
    const traits = activeRecipe.personality.configuredTraits || [];
    const newTraits = traits.includes(key) ? traits : [...traits, key];
    updatePersonality({ [key]: value, configuredTraits: newTraits });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {Object.entries(activeRecipe.personality).filter(([k]) => k !== "configuredTraits").map(([key, value]) => (
        <div key={key}>
          <label className="flex justify-between text-sm font-medium mb-1">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span>{value as number}</span>
          </label>
          <input type="range" min="0" max="100" value={value as number} onChange={(e) => handleUpdate(key, parseInt(e.target.value))} className="w-full" />
        </div>
      ))}
    </div>
  );
}
