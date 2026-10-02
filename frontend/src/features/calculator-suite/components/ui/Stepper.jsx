export function Stepper({ label, value, onChange, min = 0, max = 99 }) {
  return (
    <div className="inline-flex items-center rounded-(--radius-token-sm) border border-(--color-border)">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center text-(--color-ink-secondary) transition-colors hover:bg-(--color-surface-sunken) disabled:pointer-events-none disabled:opacity-30"
      >
        −
      </button>
      <span
        className="tabular flex h-8 w-9 items-center justify-center border-x border-(--color-border) text-sm font-medium text-(--color-ink)"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center text-(--color-ink-secondary) transition-colors hover:bg-(--color-surface-sunken) disabled:pointer-events-none disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
