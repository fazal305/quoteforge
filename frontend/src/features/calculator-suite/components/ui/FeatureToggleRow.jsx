const COMPLEXITY_STYLES = {
  low: "text-(--color-success)",
  medium: "text-(--color-warning)",
  high: "text-(--color-danger)",
};

const COMPLEXITY_LABEL = {
  low: "Low complexity",
  medium: "Medium complexity",
  high: "High complexity",
};

export function FeatureToggleRow({
  id,
  label,
  description,
  hours,
  complexity,
  checked,
  onChange,
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-(--radius-token-md) border p-3 transition-colors duration-(--duration-fast) ${
        checked
          ? "border-(--color-accent) bg-(--color-accent-soft)"
          : "border-(--color-border) bg-(--color-surface) hover:border-(--color-border-strong)"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-(--color-accent)"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2">
          <span
            className={`text-sm font-medium ${checked ? "text-(--color-accent-strong)" : "text-(--color-ink)"}`}
          >
            {label}
          </span>
          <span className="tabular text-xs text-(--color-ink-muted)">
            {hours} hrs
          </span>
          <span
            className={`text-[11px] font-medium ${COMPLEXITY_STYLES[complexity]}`}
          >
            {COMPLEXITY_LABEL[complexity]}
          </span>
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-(--color-ink-secondary)">
          {description}
        </span>
      </span>
    </label>
  );
}
