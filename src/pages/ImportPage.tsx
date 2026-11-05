import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { CharacterRecipe, RecipeRecord, createEmptyRecipe } from "../types/recipe";
import { validateRecipe, ValidationResult } from "../utils/validation";
import { migrateRecipe } from "../utils/migration";
import { FileUp, AlertCircle, CheckCircle2, XCircle, HeartPulse } from "lucide-react";

export function ImportPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"select" | "preview" | "duplicate" | "recovery">("select");
  
  const [importedRecipe, setImportedRecipe] = useState<CharacterRecipe | null>(null);
  const [rawImportData, setRawImportData] = useState<any>(null);
  const [recoveryReason, setRecoveryReason] = useState<string>("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [existingRecords, setExistingRecords] = useState<RecipeRecord[]>([]);
  const [duplicateRecord, setDuplicateRecord] = useState<RecipeRecord | null>(null);

  useEffect(() => {
    invoke<RecipeRecord[]>("get_recipes").then(setExistingRecords).catch(console.error);
  }, []);

  const handleSelectFile = async () => {
    try {
      const filePath = await open({
        filters: [{ name: "Character Recipe", extensions: ["recipe", "json"] }],
        multiple: false,
      });

      if (!filePath || typeof filePath !== "string") return;
      const contents = await readTextFile(filePath);
      
      let parsed: any;
      try {
        parsed = JSON.parse(contents);
      } catch (e) {
        setRecoveryReason("Invalid JSON structure.");
        setRawImportData(contents);
        setStep("recovery");
        return;
      }

      // Check if it's nested in metadata or v1.1 top level
      let recipeData = parsed.recipe ? parsed.recipe : parsed;
      let researchData = parsed.research || {};
      let evidenceData = parsed.evidence || [];
      let sourcesData = parsed.researchSources || [];
      
      const recipeToMigrate = { 
        ...recipeData,
        research: { ...recipeData.research, ...researchData },
        evidence: [ ...(recipeData.evidence || []), ...evidenceData ],
        researchSources: [ ...(recipeData.researchSources || []), ...sourcesData ]
      };
      
      delete recipeToMigrate.exportedAt;
      delete recipeToMigrate.application;

      setRawImportData(recipeToMigrate);

      const migratedRecipe = migrateRecipe(recipeToMigrate);

      // Simple structural checks before full validation to avoid crashes
      if (!migratedRecipe.schema || !migratedRecipe.version) {
        setRecoveryReason("Missing schema or version definitions.");
        setStep("recovery");
        return;
      }
      
      const requiredSections = ["identity", "personality", "speech", "behavior", "knowledge", "relationships", "examples"];
      const missing = requiredSections.filter(s => !migratedRecipe[s as keyof CharacterRecipe]);
      
      if (missing.length > 0) {
        setRecoveryReason(`Missing sections: ${missing.join(", ")}`);
        setStep("recovery");
        return;
      }

      processValidImport(migratedRecipe);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read file", { description: String(err) });
    }
  };

  const attemptRecovery = () => {
    try {
      const empty = createEmptyRecipe();
      // Deep merge existing valid fields into empty structure to guarantee structural integrity
      const recovered: CharacterRecipe = {
        ...empty,
        ...rawImportData,
        identity: { ...empty.identity, ...(rawImportData?.identity || {}) },
        appearance: { ...empty.appearance, ...(rawImportData?.appearance || {}) },
        personality: { ...empty.personality, ...(rawImportData?.personality || {}) },
        speech: { ...empty.speech, ...(rawImportData?.speech || {}) },
        behavior: { ...empty.behavior, ...(rawImportData?.behavior || {}) },
        restrictions: { ...empty.restrictions, ...(rawImportData?.restrictions || {}) },
        knowledge: { ...empty.knowledge, ...(rawImportData?.knowledge || {}) },
        memory: { ...empty.memory, ...(rawImportData?.memory || {}) },
        coreValues: rawImportData?.coreValues || empty.coreValues,
        goals: rawImportData?.goals || empty.goals,
        relationships: rawImportData?.relationships || empty.relationships,
        emotions: rawImportData?.emotions || empty.emotions,
        examples: rawImportData?.examples || empty.examples,
        sources: rawImportData?.sources || empty.sources,
      };

      if (!recovered.identity.name) recovered.identity.name = "Recovered Character";
      
      const migratedRecovered = migrateRecipe(recovered);

      toast.success("Recovery successful! Please review the preview.");
      processValidImport(migratedRecovered);
    } catch (err) {
      toast.error("Recovery failed completely. The file may be too corrupted.");
      setStep("select");
    }
  };

  const processValidImport = (recipe: CharacterRecipe) => {
    try {
      const validation = validateRecipe(recipe);
      setValidationResult(validation);
      setImportedRecipe(recipe);
      
      if (validation.overallStatus === "error") {
        toast.warning("Recipe contains validation errors. Please review the preview.");
      }

      const duplicate = existingRecords.find((r) => r.name === recipe.identity.name);
      if (duplicate) {
        setDuplicateRecord(duplicate);
        setStep("duplicate");
      } else {
        setStep("preview");
      }
    } catch (err) {
      setRecoveryReason("Validation crashed (Schema mismatch).");
      setStep("recovery");
    }
  };

  const handleImport = async (replaceId?: string, importAsCopy = false) => {
    if (!importedRecipe) return;

    try {
      let recordId = replaceId || crypto.randomUUID();
      let recipeName = importedRecipe.identity.name;
      
      if (importAsCopy) {
        recordId = crypto.randomUUID();
        recipeName = `${recipeName} (Copy)`;
      }

      const record: RecipeRecord = {
        id: recordId,
        name: recipeName,
        data: JSON.stringify({
          ...importedRecipe,
          identity: { ...importedRecipe.identity, name: recipeName }
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await invoke("save_recipe", { record });
      toast.success("Recipe imported successfully!");
      navigate("/library");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save imported recipe", { description: String(err) });
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex-none px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Import Recipe</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {step === "select" && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center shadow-sm">
              <FileUp className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Select a recipe file to import</h2>
              <p className="text-neutral-500 mb-8">Supports .recipe and .json formats exported from Character Recipe Studio.</p>
              <button
                onClick={handleSelectFile}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Browse Files
              </button>
            </div>
          )}

          {step === "recovery" && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-red-200 dark:border-red-900 p-8 shadow-sm">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-4">
                <AlertCircle className="w-8 h-8" />
                <h2 className="text-xl font-semibold">Import Failed</h2>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-8">
                <strong className="text-red-800 dark:text-red-400 block mb-1">Reason:</strong>
                <p className="text-red-700 dark:text-red-300 font-mono text-sm">{recoveryReason}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={() => setStep("select")}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-50 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={attemptRecovery}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors flex items-center gap-2"
                >
                  <HeartPulse className="w-4 h-4" /> Attempt Recovery
                </button>
              </div>
            </div>
          )}

          {step === "duplicate" && importedRecipe && duplicateRecord && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-amber-200 dark:border-amber-900 p-8 shadow-sm">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4">
                <AlertCircle className="w-8 h-8" />
                <h2 className="text-xl font-semibold">Recipe Already Exists</h2>
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 mb-8">
                A recipe named <strong>"{importedRecipe.identity.name}"</strong> already exists in your library. How would you like to proceed?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={() => setStep("select")}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-50 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleImport(undefined, true)}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-400 font-medium rounded-md transition-colors"
                >
                  Import As Copy
                </button>
                <button
                  onClick={() => setStep("preview")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
                >
                  Review to Replace
                </button>
              </div>
            </div>
          )}

          {step === "preview" && importedRecipe && validationResult && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Preview: {importedRecipe.identity.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  <div><strong className="text-neutral-900 dark:text-neutral-50">Category:</strong> {importedRecipe.identity.category || "None"}</div>
                  <div><strong className="text-neutral-900 dark:text-neutral-50">Source:</strong> {importedRecipe.identity.sourceType || "None"}</div>
                  <div className="col-span-2"><strong className="text-neutral-900 dark:text-neutral-50">Description:</strong> {importedRecipe.identity.description || "None"}</div>
                </div>

                <h3 className="text-md font-medium text-neutral-900 dark:text-neutral-50 mb-3 border-b border-neutral-100 dark:border-neutral-800 pb-2">Validation Status</h3>
                <ul className="space-y-2 mb-8">
                  {validationResult.rules.map(rule => (
                    <li key={rule.id} className="flex items-center gap-2 text-sm">
                      {rule.passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={rule.passed ? "text-neutral-600 dark:text-neutral-400" : "text-red-600 dark:text-red-400"}>{rule.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setStep("select")}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-50 font-medium rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleImport(duplicateRecord ? duplicateRecord.id : undefined, false)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  >
                    {duplicateRecord ? "Replace Existing" : "Confirm Import"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
