import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium text-(--color-accent)">404</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-(--color-ink-secondary)">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-accent-ink) transition hover:bg-(--color-accent-strong)"
      >
        Back to calculator
      </Link>
    </div>
  );
}
