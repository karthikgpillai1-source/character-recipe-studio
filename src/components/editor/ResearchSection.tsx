import { useState, useRef, useEffect } from "react";
import { useRecipeStore } from "../../store/useRecipeStore";
import { Copy, FileText, Maximize2, Minimize2, AlertTriangle, Plus, Trash2, Search, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { EvidenceEntry, SourceReference } from "../../types/recipe";

const RESEARCH_TEMPLATE = `CHARACTER RESEARCH TEMPLATE

=== BASIC IDENTITY ===
Name:
Aliases:
Franchise:
Universe:
Version:

Age:
Occupation:
Species:
Location:

=== APPEARANCE ===
Physical Description:
Distinct Features:
Clothing:
Equipment:

=== PERSONALITY ===
Observed Traits:
Repeated Behaviors:
Traits Never Shown:
Examples:

=== SPEECH ===
Vocabulary:
Tone:
Catchphrases:
Examples:

=== VALUES ===
Core Beliefs:
Examples:

=== GOALS ===
Primary Goal:
Secondary Goals:
Long-Term Goals:
Short-Term Goals:

=== BEHAVIOR ===
Always:
Usually:
Avoids:
Never:

=== RESTRICTIONS ===
Would Never:
Examples:

=== KNOWLEDGE ===
Expert Topics:
Known Topics:
Unknown Topics:
Forbidden Topics:

=== RELATIONSHIPS ===
Character:
Relationship:
Trust Level:
Evidence:

=== EMOTIONS ===
Praise:
Criticism:
Failure:
Danger:
Loss:
Success:

=== DIALOGUE EXAMPLES ===
Situation:
User:
Character:

=== SOURCES ===
Movie:
Episode:
Book:
Comic:
Game:
Reference Notes:

=== CONTRADICTIONS ===
Observed Contradictions:
Version Differences:
Retcons:
Notes:
`;

export function ResearchSection() {
  const { activeRecipe, activeRecord, updateResearch, updateEvidence, updateResearchSources } = useRecipeStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Notes" | "Sources" | "Evidence" | "Template">("Notes");
  
  const [showConfirm, setShowConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!activeRecipe || !activeRecord) return null;

  const notes = activeRecipe.research.notes;
  const evidence = activeRecipe.evidence || [];
  const sources = activeRecipe.researchSources || [];
  
  const charCount = notes.length;
  const wordCount = notes.trim() === "" ? 0 : notes.trim().split(/\s+/).length;
  
  const lastUpdated = new Date(activeRecord.updatedAt);
  const isToday = new Date().toDateString() === lastUpdated.toDateString();
  const formattedDate = isToday 
    ? `Today ${lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
    : lastUpdated.toLocaleDateString() + ' ' + lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateResearch({ notes: e.target.value });
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(RESEARCH_TEMPLATE);
      toast.success("Template copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy template");
    }
  };

  const handleInsertTemplate = () => {
    if (notes.trim().length > 0) {
      setShowConfirm(true);
    } else {
      executeInsertTemplate();
    }
  };

  const executeInsertTemplate = () => {
    updateResearch({ notes: RESEARCH_TEMPLATE });
    setShowConfirm(false);
    setActiveTab("Notes");
    toast.success("Template inserted");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Evidence Handlers
  const addEvidence = () => {
    const newEntry: EvidenceEntry = {
      id: crypto.randomUUID(),
      title: "New Evidence",
      sourceType: "",
      sourceName: "",
      timestamp: "",
      quote: "",
      notes: "",
      confidence: "",
      supports: {
        identity: false, appearance: false, personality: false, speech: false,
        values: false, goals: false, behavior: false, restrictions: false,
        knowledge: false, relationships: false, emotions: false
      }
    };
    updateEvidence([...evidence, newEntry]);
  };

  const updateEvidenceEntry = (id: string, updates: Partial<EvidenceEntry>) => {
    updateEvidence(evidence.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvidence = (id: string) => {
    updateEvidence(evidence.filter(e => e.id !== id));
  };

  // Sources Handlers
  const addSource = () => {
    const newSource: SourceReference = {
      id: crypto.randomUUID(),
      type: "",
      title: "New Source",
      url: "",
      notes: ""
    };
    updateResearchSources([...sources, newSource]);
  };

  const updateSourceEntry = (id: string, updates: Partial<SourceReference>) => {
    updateResearchSources(sources.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSource = (id: string) => {
    updateResearchSources(sources.filter(s => s.id !== id));
  };

  const workspaceClasses = isFullscreen
    ? "fixed inset-0 z-50 bg-neutral-50 dark:bg-neutral-950 flex flex-col p-6"
    : "flex flex-col space-y-6";

  const editorClasses = isFullscreen
    ? "flex-1 flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto w-full"
    : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]";

  return (
    <div className={workspaceClasses}>
      {isFullscreen && (
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full mb-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Character Research Workspace
          </h2>
          <button 
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            Exit Fullscreen
          </button>
        </div>
      )}

      {/* Top Controls & Stats */}
      {!isFullscreen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Research Statistics
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between pr-4">
                <span className="text-neutral-500">Characters:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{charCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-neutral-500">Words:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{wordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-neutral-500">Sources:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{sources.length}</span>
              </div>
              <div className="flex justify-between pr-4">
                <span className="text-neutral-500">Evidence:</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{evidence.length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-center gap-3">
            <p className="text-xs text-neutral-500">
              Research notes and evidence are for your reference and traceability only. They do not affect the recipe Completeness score or Recreation Readiness.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <button 
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-medium rounded transition-colors w-full justify-center"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className={editorClasses}>
        <div className="flex-none flex flex-col border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-2 text-xs font-medium text-neutral-500 tracking-wider uppercase">Character Research</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">{formattedDate}</span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-1 px-2 pt-2">
            {(["Notes", "Sources", "Evidence", "Template"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab ? "bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 border-t border-l border-r border-neutral-200 dark:border-neutral-800" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 bg-transparent"}`}
              >
                {tab}
                {tab === "Evidence" && evidence.length > 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{evidence.length}</span>}
                {tab === "Sources" && sources.length > 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{sources.length}</span>}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900 relative flex flex-col">
          
          {/* NOTES TAB */}
          {activeTab === "Notes" && (
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={handleNotesChange}
              placeholder="Paste your character research, wiki extracts, or background lore here..."
              className="flex-1 w-full p-6 bg-transparent border-none focus:ring-0 text-neutral-900 dark:text-neutral-50 resize-none font-mono text-sm leading-relaxed min-h-[400px]"
              spellCheck={false}
            />
          )}

          {/* SOURCES TAB */}
          {activeTab === "Sources" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Source Material</h3>
                  <p className="text-sm text-neutral-500">Track where your research originates.</p>
                </div>
                <button onClick={addSource} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm">
                  <Plus className="w-4 h-4" /> Add Source
                </button>
              </div>

              <div className="space-y-4">
                {sources.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                    <LinkIcon className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-500 font-medium">No sources added yet</p>
                    <p className="text-sm text-neutral-400 mt-1">Add books, movies, or wikis that you're referencing.</p>
                  </div>
                ) : (
                  sources.map((source) => (
                    <div key={source.id} className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 relative group">
                      <button onClick={() => deleteSource(source.id)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1">Source Title</label>
                          <input type="text" value={source.title} onChange={e => updateSourceEntry(source.id, { title: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50" placeholder="e.g. Batman Begins (2005)" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1">Source Type</label>
                          <select value={source.type} onChange={e => updateSourceEntry(source.id, { type: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
                            <option value="">Select Type...</option>
                            <option value="Movie">Movie</option>
                            <option value="TV Episode">TV Episode</option>
                            <option value="Book">Book</option>
                            <option value="Comic">Comic</option>
                            <option value="Game">Game</option>
                            <option value="Wiki">Wiki</option>
                            <option value="Interview">Interview</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-neutral-500 mb-1">URL (Optional)</label>
                        <input type="text" value={source.url} onChange={e => updateSourceEntry(source.id, { url: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">Reference Notes</label>
                        <textarea value={source.notes} onChange={e => updateSourceEntry(source.id, { notes: e.target.value })} rows={2} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50" placeholder="Context or specific chapters..." />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EVIDENCE TAB */}
          {activeTab === "Evidence" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Evidence Manager</h3>
                  <p className="text-sm text-neutral-500">Provide direct evidence for character traits.</p>
                </div>
                <button onClick={addEvidence} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm">
                  <Plus className="w-4 h-4" /> Add Evidence
                </button>
              </div>

              <div className="space-y-6">
                {evidence.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                    <Search className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-500 font-medium">No evidence collected yet</p>
                    <p className="text-sm text-neutral-400 mt-1">Add specific quotes, timestamps, or scenes to support your recipe.</p>
                  </div>
                ) : (
                  evidence.map((entry) => (
                    <div key={entry.id} className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 relative group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 mr-4">
                          <input type="text" value={entry.title} onChange={e => updateEvidenceEntry(entry.id, { title: e.target.value })} className="font-semibold text-lg bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-blue-500 focus:outline-none w-full text-neutral-900 dark:text-neutral-50" placeholder="Evidence Title" />
                        </div>
                        <button onClick={() => deleteEvidence(entry.id)} className="text-neutral-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1">Source Name</label>
                          <input type="text" value={entry.sourceName} onChange={e => updateEvidenceEntry(entry.id, { sourceName: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50" placeholder="e.g. Batman Begins" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-neutral-500 mb-1">Source Type</label>
                          <select value={entry.sourceType} onChange={e => updateEvidenceEntry(entry.id, { sourceType: e.target.value as any })} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
                            <option value="">Select Type...</option>
                            <option value="Movie">Movie</option>
                            <option value="TV">TV</option>
                            <option value="Book">Book</option>
                            <option value="Comic">Comic</option>
                            <option value="Game">Game</option>
                            <option value="Interview">Interview</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Timestamp/Page</label>
                            <input type="text" value={entry.timestamp} onChange={e => updateEvidenceEntry(entry.id, { timestamp: e.target.value })} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50" placeholder="00:45:22" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-neutral-500 mb-1">Confidence</label>
                            <select value={entry.confidence} onChange={e => updateEvidenceEntry(entry.id, { confidence: e.target.value as any })} className="w-full px-3 py-1.5 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
                              <option value="">Select...</option>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium text-neutral-500 mb-1">Quote or Description</label>
                        <textarea value={entry.quote} onChange={e => updateEvidenceEntry(entry.id, { quote: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-serif italic" placeholder='"It is not who I am underneath..."' />
                      </div>

                      <div className="mb-6">
                        <label className="block text-xs font-medium text-neutral-500 mb-1">Analysis / Notes</label>
                        <textarea value={entry.notes} onChange={e => updateEvidenceEntry(entry.id, { notes: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50" placeholder="What does this prove about the character?" />
                      </div>

                      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">Supports Recipe Categories</label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(entry.supports) as Array<keyof typeof entry.supports>).map(cat => {
                            const isSupported = entry.supports[cat];
                            return (
                              <button
                                key={cat}
                                onClick={() => updateEvidenceEntry(entry.id, { supports: { ...entry.supports, [cat]: !isSupported }})}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 transition-colors ${isSupported ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'}`}
                              >
                                {isSupported && <CheckCircle2 className="w-3 h-3" />}
                                <span className="capitalize">{cat}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TEMPLATE TAB */}
          {activeTab === "Template" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Research Template</h3>
                  <p className="text-sm text-neutral-500">A structured outline for organizing unstructured character lore.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCopyTemplate} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-md shadow-sm transition-colors">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <button onClick={handleInsertTemplate} className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-400 text-sm font-medium rounded-md shadow-sm transition-colors">
                    <FileText className="w-4 h-4" /> Insert into Notes
                  </button>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {RESEARCH_TEMPLATE}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-sm w-full p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Replace Notes?</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              This will replace all your existing research notes with the empty template. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeInsertTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
              >
                Replace Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
