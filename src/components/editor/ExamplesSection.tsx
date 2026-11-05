import { useRecipeStore } from "../../store/useRecipeStore";
import { Plus, Trash2 } from "lucide-react";

export function ExamplesSection() {
  const { activeRecipe, updateSection } = useRecipeStore();
  if (!activeRecipe) return null;

  const addExample = () => {
    updateSection("examples", [...activeRecipe.examples, { id: crypto.randomUUID(), situation: "", userInput: "", expectedResponse: "" }]);
  };

  const removeExample = (id: string) => {
    updateSection("examples", activeRecipe.examples.filter(e => e.id !== id));
  };

  const updateExample = (id: string, field: string, value: any) => {
    updateSection("examples", activeRecipe.examples.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
        Minimum 10 examples recommended to achieve 100% Completeness Score for this section.
      </div>
      {activeRecipe.examples.map((ex) => (
        <div key={ex.id} className="p-4 border rounded-md relative bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
          <button onClick={() => removeExample(ex.id)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium mb-1">Situation Context</label><input type="text" value={ex.situation} onChange={(e) => updateExample(ex.id, "situation", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium mb-1">User Input</label><textarea rows={2} value={ex.userInput} onChange={(e) => updateExample(ex.id, "userInput", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
            <div><label className="block text-sm font-medium mb-1">Expected Character Response</label><textarea rows={3} value={ex.expectedResponse} onChange={(e) => updateExample(ex.id, "expectedResponse", e.target.value)} className="w-full px-3 py-2 border rounded-md" /></div>
          </div>
        </div>
      ))}
      <button onClick={addExample} className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-sm font-medium rounded-md w-full justify-center">
        <Plus className="w-4 h-4" /> Add Example Dialogue
      </button>
    </div>
  );
}
