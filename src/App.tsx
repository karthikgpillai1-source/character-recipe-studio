import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Home, Library, PlusCircle, FlaskConical, Settings } from "lucide-react";
import { Toaster } from "sonner";
import { useSettingsStore } from "./store/useSettingsStore";
import { CreateRecipePage } from "./pages/CreateRecipePage";
import { RecipeEditorPage } from "./pages/RecipeEditorPage";
import { LibraryPage } from "./pages/LibraryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ImportPage } from "./pages/ImportPage";
import { SandboxPage } from "./pages/SandboxPage";
import "./App.css";

function Sidebar() {
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Library", path: "/library", icon: Library },
    { name: "Create Recipe", path: "/create", icon: PlusCircle },
    { name: "Sandbox", path: "/sandbox", icon: FlaskConical },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Character Recipe Studio
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-50"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.theme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/library" element={<LibraryPage />} />
          <Route path="/create" element={<CreateRecipePage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/editor/:id" element={<RecipeEditorPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        </Layout>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
