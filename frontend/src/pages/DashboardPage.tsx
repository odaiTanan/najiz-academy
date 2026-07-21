import { useLogout } from '../hooks/useLogout'
import { useAuthStore } from '../store/auth'
import najizLogo from '../assets/najiz_logo.png'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogout()

  return (
    <main className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-[var(--najiz-surface)] to-slate-100 p-6 shadow-lg shadow-slate-200/50">
          <p className="text-sm tracking-[0.2em] text-[var(--najiz-accent)]">أكاديمية نجيز جو</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            مرحباً، {user?.name ?? 'مستخدم'}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            من هنا تدير بنك الأسئلة، تضيف المحتوى وتتحكّم به، وتنشئ الاختبارات وتنشرها للمتدربين.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ['بنك الأسئلة', '/dashboard/questions', 'إضافة الأسئلة والخيارات'],
              ['إدارة المحتوى', '/dashboard/academies', 'أكاديميات وأقسام ودورات'],
              ['الاختبارات', '/dashboard/assessments', 'إنشاء وبدء الاختبارات'],
            ].map(([label, href, value]) => (
              <Link key={label} to={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
          <div className="flex items-center gap-3">
            <img src={najizLogo} alt="أكاديمية نجيز جو" className="h-14 w-auto object-contain" />
            <div>
              <p className="text-xs text-slate-500">العلامة</p>
              <p className="text-sm font-semibold text-slate-900">نجيز جو للتوصيل السريع</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>البريد</span>
              <span className="text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>الأدوار</span>
              <span className="text-left text-slate-900">{user?.roles.map((role) => role.name).join(', ')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            className="mt-6 w-full rounded-2xl bg-[var(--najiz-accent)] px-4 py-3 font-semibold text-slate-950 transition hover:opacity-90"
          >
            {logoutMutation.isPending ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
          </button>
        </aside>
      </section>
    </main>
  )
}
