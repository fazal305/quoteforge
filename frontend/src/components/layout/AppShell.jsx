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

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-0">
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <span className="text-sm font-semibold tracking-tight text-neutral-900">QuoteForge</span>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-0.5 p-2" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
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
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
