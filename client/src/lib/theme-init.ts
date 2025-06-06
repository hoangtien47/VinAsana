// Extend Window interface for theme initialization flag
declare global {
  interface Window {
    __themeInitialized?: boolean;
  }
}

// Initialize theme immediately to prevent flash of unstyled content (FOUC)
export function initializeTheme() {
  try {
    const STORAGE_KEY = "vinasana-appearance-settings";
    const saved = localStorage.getItem(STORAGE_KEY);
    const settings = saved ? JSON.parse(saved) : { theme: "system", density: "comfortable" };
    
    // Determine effective theme
    let effectiveTheme = settings.theme;
    if (settings.theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    // Apply theme immediately to html element
    const htmlElement = document.documentElement;
    
    if (effectiveTheme === "dark") {
      htmlElement.classList.add("dark");
      htmlElement.style.backgroundColor = "hsl(240 10% 3.9%)";
    } else {
      htmlElement.classList.remove("dark");
      htmlElement.style.backgroundColor = "hsl(0 0% 100%)";
    }
    
    // Apply density
    htmlElement.classList.remove("density-compact", "density-comfortable", "density-spacious");
    htmlElement.classList.add(`density-${settings.density || "comfortable"}`);
    
    // Set a flag to indicate theme has been initialized
    window.__themeInitialized = true;
    
  } catch (error) {
    console.warn("Failed to initialize theme:", error);
    // Fallback to system theme
    const htmlElement = document.documentElement;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      htmlElement.classList.add("dark");
      htmlElement.style.backgroundColor = "hsl(240 10% 3.9%)";
    } else {
      htmlElement.style.backgroundColor = "hsl(0 0% 100%)";
    }
    htmlElement.classList.add("density-comfortable");
    window.__themeInitialized = true;
  }
}

// Initialize theme immediately when this module is imported
initializeTheme();
