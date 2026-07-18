import { Link, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '../store/auth'

export default function AppLayout() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <Link to="/dashboard" className="text-sm font-semibold tracking-[0.25em] text-cyan-300">
            AUTH STACK
          </Link>
          <div className="text-sm text-slate-400">
            {user ? `${user.name} · ${location.pathname}` : 'Guest'}
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  )
}