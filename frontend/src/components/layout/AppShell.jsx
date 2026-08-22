import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '@/store/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/quotes', label: 'Quotes' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/customers', label: 'Customers' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/settings', label: 'Settings' },
]

export function AppShell() {
  const signOut = useAuthStore((s) => s.signOut)
  const [navOpen, setNavOpen] = useState(false)

  // Close the mobile drawer on Escape. Route changes close it directly via
  // each NavLink's onClick below, rather than reacting to location changes
  // in an effect.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-neutral-900/40 md:hidden"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-neutral-0 transition-transform duration-200 md:static md:w-56 md:translate-x-0',
          navOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <span className="text-sm font-semibold tracking-tight text-neutral-900">QuoteForge</span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 md:hidden"
            >
              ✕
            </button>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-2" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-neutral-200 p-2">
          <button
            onClick={() => signOut()}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-0">
        <div className="flex h-14 items-center gap-3 border-b border-neutral-200 bg-neutral-0 px-4 md:hidden">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
          >
            ☰
          </button>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">QuoteForge</span>
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
