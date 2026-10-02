import { NavLink, Outlet } from "react-router-dom";

import "@/features/calculator-suite/calculator-theme.css";
import { ThemeToggle } from "@/features/calculator-suite/components/ui/CalculatorThemeToggle";

const NAV_ITEMS = [
  { to: "/calculator", label: "Calculator", end: true },
  { to: "/calculator/hourly-rate", label: "Hourly Rate" },
  { to: "/calculator/ai", label: "AI Assistant" },
  { to: "/calculator/compare", label: "Compare" },
  { to: "/calculator/quotes", label: "Quotes" },
  { to: "/calculator/settings", label: "Settings" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="var(--color-accent)" />
        <path
          d="M20 40.5V23.5C20 22.1193 21.1193 21 22.5 21H33.5C34.8807 21 36 22.1193 36 23.5V33.5C36 34.8807 34.8807 36 33.5 36H26"
          stroke="var(--color-accent-ink)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M31 36L36.5 44"
          stroke="var(--color-accent-ink)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <circle cx="44" cy="41" r="3.4" fill="var(--color-gold)" />
      </svg>
      <span className="font-display text-[17px] font-semibold tracking-tight text-(--color-ink)">
        QuoteRate
      </span>
    </div>
  );
}

export function CalculatorAppShell() {
  return (
    <div className="calculator-suite min-h-screen bg-(--color-canvas)">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-(--radius-token-sm) focus:bg-(--color-surface) focus:px-4 focus:py-2 focus:shadow-(--shadow-token-md)"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-surface)/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Logo />
            <a
              href="/"
              className="hidden text-sm font-medium text-(--color-ink-muted) hover:text-(--color-ink) sm:inline"
            >
              ← QuoteForge
            </a>
          </div>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-(--radius-token-sm) px-3 py-2 text-sm font-medium transition-colors duration-(--duration-fast) ${
                    isActive
                      ? "bg-(--color-accent-soft) text-(--color-accent-strong)"
                      : "text-(--color-ink-secondary) hover:bg-(--color-surface-sunken) hover:text-(--color-ink)"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="flex items-center gap-1 overflow-x-auto border-t border-(--color-border) px-4 py-2 lg:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 rounded-(--radius-token-sm) px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? "bg-(--color-accent-soft) text-(--color-accent-strong)"
                    : "text-(--color-ink-secondary)"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
