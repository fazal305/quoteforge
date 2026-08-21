import { useThemeStore } from '@/store/theme'

export function ThemeToggle({ className = '' }) {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 ${className}`}
    >
      {isDark ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-4a1 1 0 0 1 1 1h1a1 1 0 1 1 0 2h-1a1 1 0 1 1-1-1v-1a1 1 0 0 1 0-1ZM2 10a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm13.66-5.66a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 1 1-1.42-1.41l.71-.71ZM4.93 15.07a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 1 1-1.42-1.41l.71-.71Zm10.14 0 .71.71a1 1 0 0 1-1.42 1.41l-.7-.71a1 1 0 0 1 1.41-1.41ZM4.93 4.93a1 1 0 0 1 1.41 0l.71.71A1 1 0 1 1 5.63 7.05l-.7-.71a1 1 0 0 1 0-1.41ZM10 17a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" />
        </svg>
      )}
    </button>
  )
}
