import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export type ThemeMode = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";

const MODE_KEY = "loan-tracker-theme";
const FONT_KEY = "loan-tracker-font-size";
const MOTION_KEY = "loan-tracker-reduce-motion";

const FONT_PX: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

interface ThemeContextValue {
  /** Resolved theme actually applied (system resolves to light/dark). */
  theme: Theme;
  isDark: boolean;
  /** User's chosen mode, including "system". */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored && (allowed as readonly string[]).includes(stored)) return stored as T;
  } catch {
    /* localStorage may be unavailable (private mode) */
  }
  return fallback;
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function applyFontSize(size: FontSize) {
  document.documentElement.style.fontSize = FONT_PX[size];
}

function applyReduceMotion(value: boolean) {
  document.documentElement.classList.toggle("reduce-motion", value);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    readStored<ThemeMode>(MODE_KEY, ["light", "dark", "system"], "system"),
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(() =>
    readStored<FontSize>(FONT_KEY, ["small", "medium", "large"], "medium"),
  );
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() =>
    readStored(MOTION_KEY, ["true", "false"], "false") === "true",
  );
  const [theme, setResolvedTheme] = useState<Theme>(() => resolveTheme(mode));

  useEffect(() => {
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* ignore persistence failures */
    }
  }, [mode]);

  // React to OS theme changes while in "system" mode.
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = systemPrefersDark() ? "dark" : "light";
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mode]);

  useEffect(() => {
    applyFontSize(fontSize);
    try {
      window.localStorage.setItem(FONT_KEY, fontSize);
    } catch {
      /* ignore */
    }
  }, [fontSize]);

  useEffect(() => {
    applyReduceMotion(reduceMotion);
    try {
      window.localStorage.setItem(MOTION_KEY, String(reduceMotion));
    } catch {
      /* ignore */
    }
  }, [reduceMotion]);

  const setMode = useCallback((next: ThemeMode) => setModeState(next), []);
  const setTheme = useCallback((next: Theme) => setModeState(next), []);
  const setFontSize = useCallback((next: FontSize) => setFontSizeState(next), []);
  const setReduceMotion = useCallback(
    (next: boolean) => setReduceMotionState(next),
    [],
  );
  const toggleTheme = useCallback(
    () => setModeState(resolveTheme(mode) === "dark" ? "light" : "dark"),
    [mode],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === "dark",
      mode,
      setMode,
      toggleTheme,
      setTheme,
      fontSize,
      setFontSize,
      reduceMotion,
      setReduceMotion,
    }),
    [theme, mode, setMode, toggleTheme, setTheme, fontSize, setFontSize, reduceMotion, setReduceMotion],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
