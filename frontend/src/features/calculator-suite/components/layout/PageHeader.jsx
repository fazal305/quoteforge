export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-(--color-ink-secondary)">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
