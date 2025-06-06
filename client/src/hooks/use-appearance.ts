import { useState, useEffect } from "react";

export type Theme = "light" | "dark" | "system";
export type Density = "compact" | "comfortable" | "spacious";
export type DefaultView = "kanban" | "gantt" | "list";

interface AppearanceSettings {
  theme: Theme;
  density: Density;
  defaultView: DefaultView;
}

const defaultSettings: AppearanceSettings = {
  theme: "system",
  density: "comfortable",
  defaultView: "kanban",
};

const STORAGE_KEY = "vinasana-appearance-settings";

export function useAppearance() {
  const [settings, setSettings] = useState<AppearanceSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  // Apply theme to document
  useEffect(() => {
    // Skip if theme was already initialized to prevent flash
    if (window.__themeInitialized) {
      return;
    }
    
    const effectiveTheme = settings.theme === "system" ? systemTheme : settings.theme;
    
    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.backgroundColor = "hsl(240 10% 3.9%)";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.backgroundColor = "hsl(0 0% 100%)";
    }
  }, [settings.theme, systemTheme]);

  // Apply density to document
  useEffect(() => {
    // Remove existing density classes
    document.documentElement.classList.remove("density-compact", "density-comfortable", "density-spacious");
    // Add current density class
    document.documentElement.classList.add(`density-${settings.density}`);
  }, [settings.density]);
  const updateSettings = (newSettings: Partial<AppearanceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Apply theme change immediately without flash
    if (newSettings.theme !== undefined) {
      const effectiveTheme = newSettings.theme === "system" ? systemTheme : newSettings.theme;
      if (effectiveTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.backgroundColor = "hsl(240 10% 3.9%)";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.backgroundColor = "hsl(0 0% 100%)";
      }
    }
    
    // Apply density change immediately
    if (newSettings.density !== undefined) {
      document.documentElement.classList.remove("density-compact", "density-comfortable", "density-spacious");
      document.documentElement.classList.add(`density-${newSettings.density}`);
    }
  };

  const getEffectiveTheme = () => {
    return settings.theme === "system" ? systemTheme : settings.theme;
  };

  return {
    settings,
    updateSettings,
    getEffectiveTheme,
    systemTheme,
  };
}
