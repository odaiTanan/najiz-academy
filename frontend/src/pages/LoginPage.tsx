import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin12345!')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await loginMutation.mutateAsync({ email, password })
    navigate('/dashboard', { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-6 py-10 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <section className="space-y-5">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
            Secure authentication
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Sign in to the protected workspace.
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Access tokens stay in memory only. Refresh tokens are rotated through HttpOnly cookies,
            and the SPA silently restores the session when needed.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur"
        >
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Email</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Password</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>

          <button
            className="mt-6 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>

          {loginMutation.isError ? (
            <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              Invalid credentials or server error.
            </p>
          ) : null}

          <p className="mt-4 text-xs leading-6 text-slate-400">
            Demo users: admin@example.com / Admin12345! or user@example.com / User12345!
          </p>
        </form>
      </div>
    </main>
  )
}