export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-0 px-6 py-16 text-center">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, description, action, liveDescription = false }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-0 px-4 py-4 sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-neutral-500" aria-live={liveDescription ? 'polite' : undefined}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
