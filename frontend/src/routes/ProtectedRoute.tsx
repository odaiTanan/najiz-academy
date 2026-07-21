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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-lg shadow-slate-200/50">
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