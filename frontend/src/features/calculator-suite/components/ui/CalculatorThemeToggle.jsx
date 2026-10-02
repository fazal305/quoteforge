import { useThemeStore } from "@/features/calculator-suite/calculator-theme-store";

const OPTIONS = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "System" },
];

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-(--radius-token-md) border border-(--color-border) bg-(--color-surface-sunken) p-0.5"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.mode}
          type="button"
          role="radio"
          aria-checked={mode === opt.mode}
          onClick={() => setMode(opt.mode)}
          className={`rounded-(--radius-token-sm) px-2.5 py-1 text-xs font-medium transition-colors duration-(--duration-fast) ${
            mode === opt.mode
              ? "bg-(--color-surface) text-(--color-ink) shadow-(--shadow-token-sm)"
              : "text-(--color-ink-muted) hover:text-(--color-ink-secondary)"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
