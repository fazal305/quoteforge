import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Organization, UserRole } from '@/types/domain'

interface Profile {
  role: UserRole
  organization: Organization
}

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  status: 'loading',

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
      set({
        session: newSession,
        user: newSession?.user ?? null,
        status: newSession ? 'authenticated' : 'unauthenticated',
        profile: newSession ? get().profile : null,
      })
    })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null, status: 'unauthenticated' })
  },
}))
