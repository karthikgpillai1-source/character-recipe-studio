import { useRecipeStore } from "../../store/useRecipeStore";
import { Tone, Vocabulary, ResponseLength } from "../../types/recipe";

const TONES: Tone[] = ["Formal", "Casual", "Professional", "Friendly", "Aggressive", "Reserved"];
const VOCABS: Vocabulary[] = ["Simple", "Average", "Advanced"];
const RESPONSE_LENGTHS: ResponseLength[] = ["Very Short", "Short", "Medium", "Long"];

export function SpeechSection() {
  const { activeRecipe, updateSpeech } = useRecipeStore();
  if (!activeRecipe) return null;

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tone</label>
          <select value={activeRecipe.speech.tone} onChange={(e) => updateSpeech({ tone: e.target.value as Tone })} className="w-full px-4 py-2 border rounded-md"><option value="" disabled>Select tone</option>{TONES.map(t => <option key={t} value={t}>{t}</option>)}</select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vocabulary</label>
          <select value={activeRecipe.speech.vocabulary} onChange={(e) => updateSpeech({ vocabulary: e.target.value as Vocabulary })} className="w-full px-4 py-2 border rounded-md"><option value="" disabled>Select vocab</option>{VOCABS.map(v => <option key={v} value={v}>{v}</option>)}</select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Response Length</label>
          <select value={activeRecipe.speech.responseLength} onChange={(e) => updateSpeech({ responseLength: e.target.value as ResponseLength })} className="w-full px-4 py-2 border rounded-md"><option value="" disabled>Select length</option>{RESPONSE_LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}</select>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap mt-6">
        {["usesSlang", "usesHumor", "usesProfanity", "usesCatchphrases"].map(key => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={activeRecipe.speech[key as keyof typeof activeRecipe.speech] as boolean} onChange={(e) => updateSpeech({ [key]: e.target.checked })} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
          </label>
        ))}
      </div>
      {activeRecipe.speech.usesCatchphrases && (
        <div className="mt-4"><label className="block text-sm font-medium mb-1">Catchphrases (comma separated)</label><textarea rows={2} value={activeRecipe.speech.catchphraseList.join(', ')} onChange={(e) => updateSpeech({ catchphraseList: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} className="w-full px-4 py-2 border rounded-md" /></div>
      )}
    </>
  );
}
