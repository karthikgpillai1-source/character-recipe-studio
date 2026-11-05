import { useState } from "react";
import { useRecipeStore } from "../store/useRecipeStore";
import { ChevronDown, ChevronRight, FlaskConical, CheckCircle2, XCircle, Info, AlertTriangle, Star } from "lucide-react";
import { CURRENT_SCHEMA_VERSION } from "../types/recipe";

export function SandboxPage() {
  const { activeRecipe, activeRecord, getValidation } = useRecipeStore();
  const [showRawJson, setShowRawJson] = useState(false);

  if (!activeRecipe || !activeRecord) {
    return (
      <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950 items-center justify-center p-8 text-center">
        <FlaskConical className="w-16 h-16 text-neutral-400 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">No Active Recipe</h2>
        <p className="text-neutral-500">Open a recipe from the library or create a new one to audit it here.</p>
      </div>
    );
  }

  const validation = getValidation();
  const exportPayload = {
    metadata: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      applicationVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      createdAt: activeRecord.createdAt,
      updatedAt: activeRecord.updatedAt
    },
    recipe: activeRecipe
  };

  const missingCategories = Object.entries(validation.completenessScore)
    .filter(([k, v]) => k !== 'overall' && (v as number) < 100)
    .map(([k]) => k);

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex-none px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Character Audit Workspace</h1>
          <p className="text-sm text-neutral-500 mt-1">Review character schema completeness.</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-2xl font-bold justify-end">
            <Star className="w-6 h-6 text-amber-500" />
            {validation.completenessScore.overall}/100
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Recipe Completeness Score</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Validation & Scoring Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Validation Report</h2>
              <ul className="space-y-3">
                {validation.rules.map(rule => (
                  <li key={rule.id} className="flex items-start gap-2">
                    {rule.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : rule.level === "info" ? (
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    ) : rule.level === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${
                      rule.passed ? "text-neutral-600 dark:text-neutral-400" :
                      rule.level === "info" ? "text-blue-700 dark:text-blue-400 font-medium" :
                      rule.level === "warning" ? "text-amber-700 dark:text-amber-400 font-medium" :
                      "text-red-700 dark:text-red-400 font-medium"
                    }`}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            
            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Readiness Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Recipe Status</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{validation.recipeStatus}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Recreation Readiness</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{validation.recreationReadiness}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${validation.recreationReadiness}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Example Coverage</span>
                    <span className={`text-sm font-semibold ${validation.exampleCoverage === "Critical" ? "text-red-500" : validation.exampleCoverage === "Poor" ? "text-amber-500" : "text-green-500"}`}>{validation.exampleCoverage}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Category Scores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(validation.completenessScore).filter(([k]) => k !== 'overall').map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-sm">
                    <span className="capitalize font-medium text-neutral-600 dark:text-neutral-400">{k}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${v}%` }}></div>
                      </div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-50 w-8 text-right">{v as number}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {missingCategories.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Recipe Not 100% Complete</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-2">The following categories require more data:</p>
                  <div className="flex flex-wrap gap-2">
                    {missingCategories.map(c => <span key={c} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 rounded-md capitalize">{c}</span>)}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Profile Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Traceability Status</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-500">Research Notes</span>
                  {activeRecipe.research.notes.trim().length > 0 ? <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Present</span> : <span className="text-neutral-400">Missing</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-500">Sources</span>
                  {activeRecipe.researchSources.length > 0 ? <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> {activeRecipe.researchSources.length}</span> : <span className="text-neutral-400">0</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-500">Evidence Entries</span>
                  {activeRecipe.evidence.length > 0 ? <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> {activeRecipe.evidence.length}</span> : <span className="text-neutral-400">0</span>}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-500">Recipe Sections Complete</span>
                  {validation.completenessScore.overall === 100 ? <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> 14/14</span> : <span className="text-amber-600 dark:text-amber-400">{Math.round(validation.completenessScore.overall / 100 * 14)}/14</span>}
                </div>
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-50">Traceability Score</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{validation.traceabilityScore}%</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Evidence Coverage</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-500">Categories Supported</span>
                  <span className="text-neutral-900 dark:text-neutral-50 font-medium">{validation.evidenceCoverage.categoriesSupported} / 11</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-500">Total Evidence</span>
                  <span className="text-neutral-900 dark:text-neutral-50 font-medium">{validation.evidenceCoverage.evidenceCount} entries</span>
                </div>
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">Overall Coverage</span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{validation.evidenceCoverage.coverage}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${validation.evidenceCoverage.coverage}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Identity Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Name</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.name || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Alias</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.alias || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Franchise</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.franchise || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Universe</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.universe || "—"}</dd></div>
              </dl>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Identity Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Name</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.name || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Alias</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.alias || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Franchise</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.franchise || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Universe</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.identity.universe || "—"}</dd></div>
              </dl>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Appearance Summary</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-neutral-500">Description:</span> {activeRecipe.appearance.description ? "Provided" : "Missing"}</p>
                <p><span className="font-medium text-neutral-500">Features:</span> {activeRecipe.appearance.distinguishingFeatures.length} items</p>
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Speech Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Tone</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.speech.tone || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Vocabulary</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.speech.vocabulary || "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Length</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.speech.responseLength || "—"}</dd></div>
              </dl>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Behavior Summary</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-neutral-500">Always:</span> {activeRecipe.behavior.always.length} rules</p>
                <p><span className="font-medium text-neutral-500">Never:</span> {activeRecipe.behavior.never.length} rules</p>
                <p><span className="font-medium text-neutral-500">Hard Restrictions:</span> {activeRecipe.restrictions.hard.length} rules</p>
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Personality Summary</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-neutral-500">Configured Traits:</span> {(activeRecipe.personality.configuredTraits || []).length} / 10</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(activeRecipe.personality.configuredTraits || []).map(t => <span key={t} className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded capitalize">{t.replace(/([A-Z])/g, ' $1').trim()}</span>)}
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Goals Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Primary</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.goals.primary ? "Defined" : "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Secondary</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.goals.secondary ? "Defined" : "—"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Long-Term</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.goals.longTerm ? "Defined" : "—"}</dd></div>
              </dl>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Knowledge Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Known Topics</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.knowledge.knownTopics.length}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Expert Topics</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.knowledge.expertTopics.length}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Forbidden Topics</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.knowledge.forbiddenTopics.length}</dd></div>
              </dl>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Emotions Summary</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(activeRecipe.emotions).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="capitalize text-neutral-500">{k}</span>
                    <span className={v.description || v.exampleDialogue ? "text-green-600 dark:text-green-400" : "text-neutral-300 dark:text-neutral-700"}>{v.description || v.exampleDialogue ? "Yes" : "No"}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Memory Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Enabled</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.memory.enabled ? "Yes" : "No"}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Retention Rules</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.memory.memoryRetentionRules.length}</dd></div>
                <div className="flex justify-between"><dt className="font-medium text-neutral-500">Importance Threshold</dt><dd className="text-neutral-900 dark:text-neutral-50">{activeRecipe.memory.importanceThreshold}</dd></div>
              </dl>
            </section>
            
            <section className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">Data Count Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-100 dark:border-neutral-800"><p className="text-neutral-500 mb-1">Core Values</p><p className="font-semibold text-xl">{activeRecipe.coreValues.length}</p></div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-100 dark:border-neutral-800"><p className="text-neutral-500 mb-1">Relationships</p><p className="font-semibold text-xl">{activeRecipe.relationships.length}</p></div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-100 dark:border-neutral-800"><p className="text-neutral-500 mb-1">Dialogues</p><p className="font-semibold text-xl">{activeRecipe.examples.length}</p></div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded border border-neutral-100 dark:border-neutral-800"><p className="text-neutral-500 mb-1">Canon Sources</p><p className="font-semibold text-xl">{activeRecipe.sources.length}</p></div>
              </div>
            </section>
          </div>

          {/* Raw JSON Export Preview */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              aria-expanded={showRawJson}
            >
              <h2 className="text-md font-semibold text-neutral-900 dark:text-neutral-50">Raw JSON Audit View</h2>
              {showRawJson ? <ChevronDown className="w-5 h-5 text-neutral-500" /> : <ChevronRight className="w-5 h-5 text-neutral-500" />}
            </button>
            {showRawJson && (
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-950">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(exportPayload, null, 2)}
                </pre>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
