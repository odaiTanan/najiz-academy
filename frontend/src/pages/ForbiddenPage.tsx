import { Link } from 'react-router-dom'

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-4xl items-center px-6 py-10" dir="rtl" lang="ar">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
        <p className="mb-3 text-sm text-rose-600">403 غير مصرح</p>
        <h1 className="text-3xl font-semibold text-slate-900">ليس لديك صلاحية لعرض هذه الصفحة.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
          المسار محمي بصلاحيات الأدوار. اطلب من المسؤول الدور أو الصلاحية المناسبة.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          العودة للوحة التحكم
        </Link>
      </div>
    </main>
  )
}
