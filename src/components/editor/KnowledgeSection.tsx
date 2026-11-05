import { useRecipeStore } from "../../store/useRecipeStore";

export function KnowledgeSection() {
  const { activeRecipe, updateKnowledge } = useRecipeStore();
  if (!activeRecipe) return null;

  return (
    <div className="space-y-4">
      {["knownTopics", "unknownTopics", "expertTopics", "forbiddenTopics"].map(key => (
        <div key={key}>
          <label className="block text-sm font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()} (comma separated)</label>
          <textarea rows={2} value={activeRecipe.knowledge[key as keyof typeof activeRecipe.knowledge]?.join(', ') || ''} onChange={(e) => {
            updateKnowledge({ [key]: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) });
          }} className="w-full px-4 py-2 border rounded-md" />
        </div>
      ))}
    </div>
  );
}
