import { useEffect, useState } from "react";
import { useSettingsStore, Theme, ExportFormat, SortOption } from "../store/useSettingsStore";
import { invoke } from "@tauri-apps/api/core";
import { SCHEMA_VERSION_V1 } from "../types/package";
import { Moon, Sun, Monitor, HardDrive, Clock, Info } from "lucide-react";

export function SettingsPage() {
  const {
    theme,
    defaultExportFormat,
    autosaveEnabled,
    autosaveDelayMs,
    defaultSort,
    setTheme,
    setDefaultExportFormat,
    setAutosaveEnabled,
    setAutosaveDelayMs,
    setDefaultSort,
  } = useSettingsStore();

  const [appDataDir, setAppDataDir] = useState<string>("Loading...");

  useEffect(() => {
    invoke<string>("get_app_data_dir")
      .then(setAppDataDir)
      .catch((e) => setAppDataDir("Unavailable - " + String(e)));
  }, []);

  return (
    <div className="flex flex-col h-full bg-neutral-50 dark:bg-neutral-950">
      <header className="flex-none px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Application Settings */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-neutral-500" />
              Application
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Theme
                </label>
                <div className="flex gap-3">
                  {(["light", "dark", "system"] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        theme === t
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900"
                      }`}
                    >
                      {t === "light" && <Sun className="w-4 h-4" />}
                      {t === "dark" && <Moon className="w-4 h-4" />}
                      {t === "system" && <Monitor className="w-4 h-4" />}
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Default Export Format
                </label>
                <select
                  value={defaultExportFormat}
                  onChange={(e) => setDefaultExportFormat(e.target.value as ExportFormat)}
                  className="w-full max-w-xs px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recipe">.recipe (Recommended)</option>
                  <option value="json">.json</option>
                </select>
              </div>
            </div>
          </section>

          {/* Editor Settings */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-500" />
              Editor
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Autosave
                  </label>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Automatically save changes while editing.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autosaveEnabled}
                    onChange={(e) => setAutosaveEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {autosaveEnabled && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Autosave Delay (Seconds)
                  </label>
                  <select
                    value={autosaveDelayMs}
                    onChange={(e) => setAutosaveDelayMs(Number(e.target.value))}
                    className="w-full max-w-xs px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1000}>1 second</option>
                    <option value={3000}>3 seconds</option>
                    <option value={5000}>5 seconds</option>
                    <option value={10000}>10 seconds</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Library Settings */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-neutral-500" />
              Library & Data
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Default Library Sort
                </label>
                <select
                  value={defaultSort}
                  onChange={(e) => setDefaultSort(e.target.value as SortOption)}
                  className="w-full max-w-xs px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Last Modified">Last Modified</option>
                  <option value="Created Date">Created Date</option>
                  <option value="Name">Name</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Application Data Location
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appDataDir}
                    className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-neutral-600 dark:text-neutral-400 font-mono focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  This folder contains your SQLite database and application settings.
                </p>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-neutral-500" />
              About
            </h2>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">Application Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">Current Schema</span>
                <span className="font-mono">{SCHEMA_VERSION_V1}</span>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
