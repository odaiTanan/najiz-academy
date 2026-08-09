import { useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

import najizLogo from '../../assets/najiz_logo.png'
import { useAuthStore } from '../../store/auth'
import { dashboardNavigation } from './dashboard-nav'

interface DashboardLayoutProps {
  children?: ReactNode
}

function hasAccess(userRoles: string[], userPermissions: string[], item: (typeof dashboardNavigation)[number]): boolean {
  const roleAllowed = !item.roles?.length || item.roles.some((role) => userRoles.includes(role))
  const permissionAllowed = !item.permissions?.length || item.permissions.some((permission) => userPermissions.includes(permission))

  return roleAllowed && permissionAllowed
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const visibleNavigation = useMemo(() => {
    const userRoles = user?.roles.map((role) => role.name) ?? []
    const userPermissions = user?.permissions ?? []

    return dashboardNavigation.filter((item) => hasAccess(userRoles, userPermissions, item))
  }, [user])

  return (
    <div className="min-h-screen bg-[var(--najiz-bg)] text-[var(--najiz-foreground)]" dir="rtl" lang="ar">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-l border-slate-200 bg-[var(--najiz-surface)]/95 px-5 py-6 shadow-lg shadow-slate-200/50 backdrop-blur xl:flex">
          <Link to="/dashboard" className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <img src={najizLogo} alt="أكاديمية ناجز جو" className="h-12 w-auto object-contain" />
            <div>
              <p className="text-xs tracking-[0.2em] text-[var(--najiz-accent)]">ناجز جو</p>
              <p className="text-sm font-semibold text-slate-900">الأكاديمية</p>
            </div>
          </Link>

          <nav className="space-y-2">
            {visibleNavigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) =>
                  [
                    'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive ? 'bg-[var(--najiz-accent)] text-slate-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-600">
            <p className="text-xs text-slate-500">الدور الحالي</p>
            <p className="mt-2 font-semibold text-slate-900">{user?.roles[0]?.name ?? 'زائر'}</p>
            <p className="mt-1 text-xs text-slate-500">{location.pathname}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-[var(--najiz-surface)]/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 sm:px-6 xl:px-8">
              <button
                type="button"
                onClick={() => setSidebarOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 xl:hidden"
              >
                القائمة
              </button>

              <div className="hidden items-center gap-3 xl:flex">
                <div className="rounded-full bg-[var(--najiz-accent)]/15 px-3 py-1 text-xs font-semibold text-[var(--najiz-accent)]">
                  أكاديمية ناجز جو
                </div>
              </div>

              <div className="text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{user?.name ?? 'زائر'}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </header>

          {sidebarOpen ? (
            <div className="xl:hidden">
              <div className="fixed inset-0 z-40 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
              <aside className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] border-l border-slate-200 bg-[var(--najiz-surface)] px-5 py-6 shadow-xl shadow-slate-300/50">
                <div className="mb-6 flex items-center justify-between">
                  <img src={najizLogo} alt="أكاديمية ناجز جو" className="h-12 w-auto object-contain" />
                  <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
                    إغلاق
                  </button>
                </div>
                <nav className="space-y-2">
                  {visibleNavigation.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.href === '/dashboard'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        [
                          'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                          isActive ? 'bg-[var(--najiz-accent)] text-slate-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                        ].join(' ')
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </aside>
            </div>
          ) : null}

          <main className="flex-1 px-4 py-6 sm:px-6 xl:px-8">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  )
}
