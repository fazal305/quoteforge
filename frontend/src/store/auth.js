import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  status: 'loading',
  // True when the session disappeared unexpectedly (e.g. expired/revoked token)
  // rather than through a deliberate signOut() call.
  sessionExpired: false,
  _loggingOut: false,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null, status: session ? 'authenticated' : 'unauthenticated' })
    } catch (error) {
      console.error('Failed to load Supabase session:', error)
      set({ status: 'unauthenticated' })
    }

    supabase.auth.onAuthStateChange((_event, newSession) => {
      const wasAuthenticated = get().status === 'authenticated'
      const isDeliberateLogout = get()._loggingOut
      set({
        session: newSession,
        user: newSession?.user ?? null,
        status: newSession ? 'authenticated' : 'unauthenticated',
        profile: newSession ? get().profile : null,
        sessionExpired: !newSession && wasAuthenticated && !isDeliberateLogout,
        _loggingOut: newSession ? get()._loggingOut : false,
      })
    })
  },

  signOut: async () => {
    set({ _loggingOut: true })
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null, status: 'unauthenticated', sessionExpired: false, _loggingOut: false })
  },

  clearSessionExpired: () => set({ sessionExpired: false }),
}))
