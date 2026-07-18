import { create } from 'zustand'

import type { AuthSession, AuthState, AuthUser } from '../types/auth'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setSession: (session: AuthSession) =>
    set({
      user: session.user,
      accessToken: session.accessToken,
    }),
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
  setUser: (user: AuthUser | null) => set({ user }),
  clearSession: () => set({ user: null, accessToken: null }),
}))