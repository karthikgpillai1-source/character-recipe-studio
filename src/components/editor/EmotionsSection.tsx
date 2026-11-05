import { useRecipeStore } from "../../store/useRecipeStore";

export function EmotionsSection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const updateEmotion = (key: keyof typeof activeRecipe.emotions, field: "description" | "exampleDialogue", val: string) => {
    updateSection("emotions", {
      ...activeRecipe.emotions,
      [key]: {
        ...activeRecipe.emotions[key],
        [field]: val
      }
    });
  };

  return (
    <div className="space-y-6">
      {Object.keys(activeRecipe.emotions).map((key) => {
        const emotion = activeRecipe.emotions[key as keyof typeof activeRecipe.emotions];
        return (
          <div key={key} className="p-4 border rounded-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <h4 className="font-semibold capitalize mb-3">{key} Response</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={emotion.description} onChange={(e) => updateEmotion(key as any, "description", e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Example Dialogue</label>
                <textarea rows={2} value={emotion.exampleDialogue} onChange={(e) => updateEmotion(key as any, "exampleDialogue", e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
