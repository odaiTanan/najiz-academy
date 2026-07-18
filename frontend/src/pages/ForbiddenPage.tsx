import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl items-center px-6 py-10">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-rose-300">403 Access Denied</p>
        <h1 className="text-3xl font-semibold text-white">You do not have permission to view this page.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
          The route is protected by RBAC. Ask an administrator for the required role or permission.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}