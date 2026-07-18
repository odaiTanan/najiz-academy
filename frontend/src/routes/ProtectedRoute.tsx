import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuthStore } from '../store/auth'
import { useUserSession } from '../hooks/useUserSession'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const sessionQuery = useUserSession(true)

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 shadow-xl shadow-cyan-950/20">
          Restoring your session...
        </div>
      </div>
    )
  }

  if (!accessToken && sessionQuery.isError) {
    return <Navigate to="/login" replace />
  }

  if (!accessToken && !sessionQuery.data) {
    return <Navigate to="/login" replace />
  }

  return children
}