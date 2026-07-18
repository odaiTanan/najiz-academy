import { useMutation } from '@tanstack/react-query'

import { logoutRequest } from '../api/auth'
import { useAuthStore } from '../store/auth'
import { queryClient } from '../lib/queryClient'

export function useLogout() {
  return useMutation({
    mutationFn: () => logoutRequest(),
    onSettled: () => {
      useAuthStore.getState().clearSession()
      queryClient.removeQueries({ queryKey: ['auth'] })
    },
  })
}