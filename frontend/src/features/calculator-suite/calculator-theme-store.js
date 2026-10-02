import { create } from "zustand";

const STORAGE_KEY = "quoterate.theme";

function applyTheme(mode) {
  // Namespaced attribute (data-calc-theme, not data-theme) so this
  // doesn't collide with quoteforge's own `.dark`-class theme toggle —
  // the two coexist independently on the same <html> element.
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-calc-theme");
  } else {
    root.setAttribute("data-calc-theme", mode);
  }
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage unavailable (private mode, disabled storage) — fall back silently
  }
  return "system";
}

export const useThemeStore = create((set) => ({
  mode: readStoredTheme(),
  setMode: (mode) => {
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // best-effort persistence only
    }
    set({ mode });
  },
}));

// Apply the persisted theme immediately on module load so there is no
// flash of the wrong theme before React mounts.
applyTheme(useThemeStore.getState().mode);
