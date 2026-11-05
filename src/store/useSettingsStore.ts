import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type ExportFormat = "json" | "recipe";
export type SortOption = "Last Modified" | "Created Date" | "Name";

interface SettingsState {
  theme: Theme;
  defaultExportFormat: ExportFormat;
  autosaveEnabled: boolean;
  autosaveDelayMs: number;
  defaultSort: SortOption;
  
  setTheme: (theme: Theme) => void;
  setDefaultExportFormat: (format: ExportFormat) => void;
  setAutosaveEnabled: (enabled: boolean) => void;
  setAutosaveDelayMs: (ms: number) => void;
  setDefaultSort: (sort: SortOption) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      defaultExportFormat: "recipe",
      autosaveEnabled: true,
      autosaveDelayMs: 3000,
      defaultSort: "Last Modified",

      setTheme: (theme) => set({ theme }),
      setDefaultExportFormat: (format) => set({ defaultExportFormat: format }),
      setAutosaveEnabled: (enabled) => set({ autosaveEnabled: enabled }),
      setAutosaveDelayMs: (ms) => set({ autosaveDelayMs: ms }),
      setDefaultSort: (sort) => set({ defaultSort: sort }),
    }),
    {
      name: "character-recipe-settings",
    }
  )
);
