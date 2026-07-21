import type { FormEvent, ReactNode } from 'react'

interface ManagementFormModalProps {
  open: boolean
  title: string
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  isSubmitting?: boolean
  children: ReactNode
  submitLabel?: string
}

export function ManagementFormModal({
  open,
  title,
  onClose,
  onSubmit,
  isSubmitting = false,
  children,
  submitLabel = 'حفظ',
}: ManagementFormModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/50">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            إغلاق
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[var(--najiz-accent)] px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {isSubmitting ? 'جاري الحفظ...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export const inputClassName =
  'w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--najiz-accent)]/50'

export function ActionButton({
  children,
  onClick,
  variant = 'default',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'danger' | 'ghost'
}) {
  const styles =
    variant === 'danger'
      ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
      : variant === 'ghost'
        ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
        : 'bg-[var(--najiz-accent)] text-slate-950 hover:opacity-90'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition ${styles}`}
    >
      {children}
    </button>
  )
}
