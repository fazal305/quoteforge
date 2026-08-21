import { create } from 'zustand'

const STORAGE_KEY = 'quoteforge-theme'

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialTheme = getInitialTheme()
if (typeof document !== 'undefined') applyTheme(initialTheme)

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },
}))
