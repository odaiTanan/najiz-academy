import { useLogout } from '../hooks/useLogout'
import { useAuthStore } from '../store/auth'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogout()

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Protected area</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Welcome back, {user?.name ?? 'member'}.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            This page is guarded by <span className="text-cyan-300">ProtectedRoute</span> and{' '}
            <span className="text-cyan-300">Authorize</span>. The backend payload includes roles
            and effective permissions so the UI can sync instantly after login or refresh.
          </p>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Session summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <span>Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <span>Roles</span>
              <span className="text-white">{user?.roles.map((role) => role.name).join(', ')}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <p className="mb-2 text-white">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {user?.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="mt-6 w-full rounded-2xl bg-rose-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-rose-300"
          >
            {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
          </button>
        </aside>
      </section>
    </main>
  )
}