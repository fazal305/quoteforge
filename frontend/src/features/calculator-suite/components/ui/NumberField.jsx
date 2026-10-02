import { useId } from "react";

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  hint,
  min = 0,
  max,
  step = 1,
  error,
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-(--color-ink)"
      >
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className={`tabular block w-full rounded-(--radius-token-sm) border bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) transition-colors duration-(--duration-fast) focus:outline-none focus:ring-2 focus:ring-(--color-accent) ${
            error ? "border-(--color-danger)" : "border-(--color-border)"
          } ${suffix ? "pr-14" : ""}`}
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(0);
              return;
            }
            const parsed = Number(raw);
            if (Number.isNaN(parsed)) return;
            onChange(parsed);
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-(--color-ink-muted)">
            {suffix}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-(--color-ink-muted)">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-(--color-danger)"
        >
          {error}
        </p>
      )}
    </div>
  );
}
