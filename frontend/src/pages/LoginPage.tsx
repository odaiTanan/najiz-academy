import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLogin } from '../hooks/useLogin'
import najizLogo from '../assets/najiz_logo.png'

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
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10" dir="rtl" lang="ar">
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <img src={najizLogo} alt="أكاديمية نجيز جو" className="h-14 w-auto object-contain" />
            <div>
              <p className="text-xs tracking-[0.2em] text-[var(--najiz-accent)]">نجيز جو</p>
              <p className="text-sm font-semibold text-slate-900">الأكاديمية</p>
            </div>
          </div>
          <span className="inline-flex rounded-full border border-[var(--najiz-accent)]/30 bg-[var(--najiz-accent)]/10 px-4 py-2 text-sm text-[var(--najiz-accent)]">
            دخول آمن
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            سجّل الدخول إلى مساحة العمل.
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            أدِر بنك الأسئلة، المحتوى، والاختبارات من لوحة تحكم عربية بالكامل.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50"
        >
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm text-slate-700">البريد الإلكتروني</span>
              <input
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--najiz-accent)]/50"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-700">كلمة المرور</span>
              <input
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--najiz-accent)]/50"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>

          <button
            className="mt-6 w-full rounded-2xl bg-[var(--najiz-accent)] px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>

          {loginMutation.isError ? (
            <p className="mt-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              بيانات الدخول غير صحيحة أو حدث خطأ في الخادم.
            </p>
          ) : null}
        </form>
      </div>
    </main>
  )
}
