import { useQuery } from '@tanstack/react-query'

import { fetchSessionRequest } from '../api/auth'
import { useAuthStore } from '../store/auth'

export function useUserSession(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const user = await fetchSessionRequest()
      useAuthStore.getState().setUser(user)

      return user
    },
    enabled,
    staleTime: 60_000,
  })
}