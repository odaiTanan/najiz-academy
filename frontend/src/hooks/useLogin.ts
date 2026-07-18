import { useMutation } from '@tanstack/react-query'

import { loginRequest, type LoginPayload } from '../api/auth'
import { useAuthStore } from '../store/auth'
import { queryClient } from '../lib/queryClient'

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
    onSuccess: (session) => {
      useAuthStore.getState().setSession(session)
      queryClient.setQueryData(['auth', 'session'], session.user)
    },
  })
}