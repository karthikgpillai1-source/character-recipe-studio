import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useRecipeStore } from "../store/useRecipeStore";
import { CheckCircle2, XCircle, Save, Info, AlertTriangle, Download, Star } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { useSettingsStore } from "../store/useSettingsStore";

import { IdentitySection } from "../components/editor/IdentitySection";
import { AppearanceSection } from "../components/editor/AppearanceSection";
import { PersonalitySection } from "../components/editor/PersonalitySection";
import { SpeechSection } from "../components/editor/SpeechSection";
import { ValuesSection } from "../components/editor/ValuesSection";
import { GoalsSection } from "../components/editor/GoalsSection";
import { BehaviorSection } from "../components/editor/BehaviorSection";
import { RestrictionsSection } from "../components/editor/RestrictionsSection";
import { KnowledgeSection } from "../components/editor/KnowledgeSection";
import { RelationshipsSection } from "../components/editor/RelationshipsSection";
import { EmotionsSection } from "../components/editor/EmotionsSection";
import { ExamplesSection } from "../components/editor/ExamplesSection";
import { SourcesSection } from "../components/editor/SourcesSection";
import { MemorySection } from "../components/editor/MemorySection";
import { ResearchSection } from "../components/editor/ResearchSection";

type EditorSection = "Identity" | "Research" | "Appearance" | "Personality" | "Speech" | "Core Values" | "Goals" | "Behavior" | "Restrictions" | "Knowledge" | "Relationships" | "Emotions" | "Examples" | "Sources" | "Memory";

export function RecipeEditorPage() {
  useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNew = searchParams.get("new") === "true";
  const [activeSection, setActiveSection] = useState<EditorSection>("Identity");

  const { activeRecord, activeRecipe, saveStatus, getValidation, setSaveStatus, setRecipe } = useRecipeStore();
  const { defaultExportFormat, autosaveEnabled, autosaveDelayMs } = useSettingsStore();
  const validation = getValidation();

  const handleSave = async () => {
    if (!activeRecipe || !activeRecord || saveStatus === "Saved") return;
    setSaveStatus("Saving...");
    const updatedRecord = {
      ...activeRecord,
      name: activeRecipe.identity.name || "Untitled Recipe",
      data: JSON.stringify(activeRecipe),
      updatedAt: new Date().toISOString(),
    };
    try {
      await invoke("save_recipe", { record: updatedRecord });
      setRecipe(updatedRecord, activeRecipe);
    } catch (error) {
      console.error("Failed to save recipe:", error);
      setSaveStatus("Unsaved Changes");
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!autosaveEnabled || isExporting || saveStatus !== "Unsaved Changes") return;
    const timeoutId = setTimeout(() => { handleSave(); }, autosaveDelayMs);
    return () => clearTimeout(timeoutId);
  }, [activeRecipe, autosaveEnabled, autosaveDelayMs, isExporting, saveStatus]);

  const handleExport = async () => {
    if (!activeRecipe || !activeRecord) return;
    if (validation.overallStatus === "error" || validation.completenessScore.overall < 100) {
      const proceed = window.confirm("Your recipe has validation errors or is not 100% complete. Are you sure you want to export an unfinished recipe?");
      if (!proceed) return;
    }
    setIsExporting(true);
    try {
      const filePath = await save({
        filters: [{ name: "Character Recipe", extensions: ["recipe", "json"] }],
        defaultPath: `${activeRecipe.identity.name || "Untitled_Recipe"}.${defaultExportFormat}`,
      });
      if (!filePath) { setIsExporting(false); return; }
      const { research, evidence, researchSources, ...recipeWithoutResearch } = activeRecipe;
      const exportPayload = { 
        schema: "recipe-v2",
        application: "Character Recipe Studio",
        version: "1.1.0",
        exportedAt: new Date().toISOString(),
        recipeId: activeRecord.id,
        recipeStatus: validation.recipeStatus,
        completeness: validation.completenessScore.overall,
        recreationReadiness: validation.recreationReadiness,
        recipe: recipeWithoutResearch,
        research,
        evidence,
        researchSources
      };
      await writeTextFile(filePath, JSON.stringify(exportPayload, null, 2));
      toast.success("Recipe exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export recipe");
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeRecipe) {
    return <div className="flex-1 flex items-center justify-center h-full"><p className="text-neutral-500">Loading recipe or not found...</p></div>;
  }

  const sections: EditorSection[] = ["Identity", "Research", "Appearance", "Personality", "Speech", "Core Values", "Goals", "Behavior", "Restrictions", "Knowledge", "Relationships", "Emotions", "Examples", "Sources", "Memory"];

  const handleDismissWizard = () => {
    setSearchParams({});
  };

  const handleStartWizard = () => {
    setActiveSection("Identity");
    handleDismissWizard();
  };

  const checklistKeys = [
    { key: "identity", label: "Identity" },
    { key: "appearance", label: "Appearance" },
    { key: "personality", label: "Personality" },
    { key: "speech", label: "Speech" },
    { key: "values", label: "Values" },
    { key: "goals", label: "Goals" },
    { key: "behavior", label: "Behavior" },
    { key: "restrictions", label: "Restrictions" },
    { key: "knowledge", label: "Knowledge" },
    { key: "relationships", label: "Relationships" },
    { key: "emotions", label: "Emotions" },
    { key: "examples", label: "Examples" },
    { key: "sources", label: "Sources" },
    { key: "memory", label: "Memory" }
  ];
  
  const completedCount = checklistKeys.filter(item => (validation.completenessScore as any)[item.key] > 0).length;

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950">
      {isNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">Recipe Created</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-sm">Recommended next steps for high-fidelity character recreation:</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">1</div>
                Complete Identity
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</div>
                Complete Personality
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">3</div>
                Complete Speech
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">4</div>
                Add Example Dialogues
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">5</div>
                Add Sources
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button onClick={handleDismissWizard} className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50">Skip</button>
              <button onClick={handleStartWizard} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm">Start Identity</button>
            </div>
          </div>
        </div>
      )}
      <header className="flex-none h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.name || "Untitled Recipe"}</h2>
          <span className={`text-sm font-medium px-2 py-1 rounded-md ${saveStatus === "Saved" ? "bg-green-100 text-green-700" : saveStatus === "Saving..." ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{saveStatus}</span>
          <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md shadow-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-900"><Download className="w-4 h-4" />Export</button>
          <button onClick={handleSave} disabled={saveStatus === "Saved" || saveStatus === "Saving..."} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md shadow-sm ${saveStatus === "Saved" || saveStatus === "Saving..." ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}><Save className="w-4 h-4" />Save</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sections.map((section) => (
              <button key={section} onClick={() => setActiveSection(section)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === section ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-50"}`}>
                {section}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{activeSection}</h3>
            </div>
            <div className="p-6 space-y-6">
              {activeSection === "Identity" && <IdentitySection />}
              {activeSection === "Research" && <ResearchSection />}
              {activeSection === "Appearance" && <AppearanceSection />}
              {activeSection === "Personality" && <PersonalitySection />}
              {activeSection === "Speech" && <SpeechSection />}
              {activeSection === "Core Values" && <ValuesSection />}
              {activeSection === "Goals" && <GoalsSection />}
              {activeSection === "Behavior" && <BehaviorSection />}
              {activeSection === "Restrictions" && <RestrictionsSection />}
              {activeSection === "Knowledge" && <KnowledgeSection />}
              {activeSection === "Relationships" && <RelationshipsSection />}
              {activeSection === "Emotions" && <EmotionsSection />}
              {activeSection === "Examples" && <ExamplesSection />}
              {activeSection === "Sources" && <SourcesSection />}
              {activeSection === "Memory" && <MemorySection />}
            </div>
          </div>
        </main>

        <aside className="w-72 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500"/> Recipe Completeness</h3>
            
            <div className="mb-4">
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Recipe Status</div>
              <div className="font-medium text-neutral-900 dark:text-neutral-50">{validation.recipeStatus}</div>
            </div>
            
            <div className="mb-4">
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Recreation Readiness</div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${validation.recreationReadiness}%` }}></div></div>
                <span className="font-semibold text-sm">{validation.recreationReadiness}%</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Example Coverage</div>
              <div className={`font-medium ${validation.exampleCoverage === "Critical" ? "text-red-500" : validation.exampleCoverage === "Poor" ? "text-amber-500" : "text-green-500"}`}>{validation.exampleCoverage} ({activeRecipe.examples.length})</div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between items-end mb-2">
                <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Completeness Score</div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{validation.completenessScore.overall}/100</div>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1"><div className="bg-amber-500 h-1 rounded-full" style={{ width: `${validation.completenessScore.overall}%` }}></div></div>
            </div>
          </div>

          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Recipe Setup</h3>
            <div className="text-xs font-medium text-neutral-500 mb-3">{completedCount} / 14 Sections Started</div>
            <div className="space-y-1.5">
              {checklistKeys.map(item => {
                const isStarted = (validation.completenessScore as any)[item.key] > 0;
                return (
                  <div key={item.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isStarted} readOnly className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 bg-neutral-100 dark:bg-neutral-800" />
                    <span className={isStarted ? "text-neutral-500 line-through" : "text-neutral-700 dark:text-neutral-300"}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">Validation Results</h3>
            <div className="mt-2 flex items-center gap-2">
              {validation.overallStatus === "success" ? (
                <span className="flex items-center gap-1 text-sm font-medium text-green-600"><CheckCircle2 className="w-4 h-4" /> All rules passed</span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-medium text-red-600"><XCircle className="w-4 h-4" /> Validation errors</span>
              )}
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {validation.rules.map((rule) => (
                <li key={rule.id} className="flex items-start gap-2">
                  {rule.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : rule.level === "info" ? (
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  ) : rule.level === "warning" ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span className={`text-sm ${rule.passed ? "text-neutral-600" : rule.level === "info" ? "text-blue-700 font-medium" : rule.level === "warning" ? "text-amber-700 font-medium" : "text-red-700 font-medium"}`}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
