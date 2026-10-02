export function RadioCardGroup({
  ariaLabel,
  options,
  value,
  onChange,
  columns = 2,
}) {
  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  }[columns];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`grid gap-3 ${gridClass}`}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.id)}
            className={`flex flex-col items-start rounded-(--radius-token-md) border p-3.5 text-left transition-colors duration-(--duration-fast) ${
              selected
                ? "border-(--color-accent) bg-(--color-accent-soft)"
                : "border-(--color-border) bg-(--color-surface) hover:border-(--color-border-strong)"
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span
                className={`text-sm font-medium ${
                  selected
                    ? "text-(--color-accent-strong)"
                    : "text-(--color-ink)"
                }`}
              >
                {opt.label}
              </span>
              {opt.badge && (
                <span className="tabular shrink-0 rounded-full bg-(--color-surface-sunken) px-2 py-0.5 text-[11px] font-medium text-(--color-ink-muted)">
                  {opt.badge}
                </span>
              )}
            </div>
            {opt.description && (
              <span className="mt-1 text-xs leading-relaxed text-(--color-ink-secondary)">
                {opt.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
