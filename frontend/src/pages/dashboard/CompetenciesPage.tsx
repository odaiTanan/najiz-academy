import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCompetency,
  deleteCompetency,
  fetchCompetencies,
  fetchLookups,
  type CompetencyRecord,
  updateCompetency,
} from '../../api/management'
import { ActionButton, Field, inputClassName, ManagementFormModal } from '../../components/management/ManagementFormModal'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'
import { useAuthStore } from '../../store/auth'

const emptyForm = () => ({
  department_id: '',
  code: '',
  name: '',
  description: '',
  weight: '1',
  success_threshold: '70',
  sort_order: '0',
  is_active: true,
})

export default function CompetenciesPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const canManage = user?.roles.some((role) => ['System Administrator', 'HR Manager'].includes(role.name)) ?? false

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CompetencyRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const competenciesQuery = useQuery({
    queryKey: ['management', 'competencies'],
    queryFn: fetchCompetencies,
  })

  const lookupsQuery = useQuery({
    queryKey: ['management', 'lookups'],
    queryFn: fetchLookups,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        department_id: Number(form.department_id),
        code: form.code,
        name: form.name,
        description: form.description || null,
        weight: Number(form.weight || 1),
        success_threshold: Number(form.success_threshold || 70),
        sort_order: Number(form.sort_order || 0),
        is_active: form.is_active,
      }
      return editing ? updateCompetency(editing.id, payload) : createCompetency(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'competencies'] })
      await queryClient.invalidateQueries({ queryKey: ['management', 'lookups'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
      setError(null)
    },
    onError: () => setError('تعذر حفظ الكفاءة.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCompetency,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'competencies'] })
      await queryClient.invalidateQueries({ queryKey: ['management', 'lookups'] })
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  function openEdit(row: CompetencyRecord) {
    setEditing(row)
    setForm({
      department_id: String(row.department_id || row.department?.id || ''),
      code: row.code,
      name: row.name,
      description: row.description ?? '',
      weight: String(row.weight ?? 1),
      success_threshold: String(row.success_threshold ?? 70),
      sort_order: String(row.sort_order ?? 0),
      is_active: row.is_active,
    })
    setError(null)
    setOpen(true)
  }

  return (
    <>
      <ManagementTablePage
        eyebrow="إدارة المحتوى"
        title="الكفاءات"
        description="عرّف الكفاءات وحدود النجاح لربطها بالأسئلة وخطط التدريب."
        rows={competenciesQuery.data?.data ?? []}
        totalCount={competenciesQuery.data?.total}
        isLoading={competenciesQuery.isLoading}
        emptyMessage="لا توجد كفاءات بعد."
        actions={canManage ? <ActionButton onClick={openCreate}>إضافة كفاءة</ActionButton> : null}
        columns={[
          { header: 'الرمز', cell: (row) => row.code },
          { header: 'الاسم', cell: (row) => row.name },
          { header: 'القسم', cell: (row) => row.department?.name ?? '—' },
          { header: 'الوزن', cell: (row) => row.weight },
          { header: 'حد النجاح', cell: (row) => row.success_threshold },
          { header: 'الأسئلة', cell: (row) => row.questions_count ?? 0 },
          {
            header: 'إجراءات',
            cell: (row) =>
              canManage ? (
                <div className="flex flex-wrap gap-2">
                  <ActionButton variant="ghost" onClick={() => openEdit(row)}>تعديل</ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() => {
                      if (window.confirm('هل تريد حذف هذه الكفاءة؟')) deleteMutation.mutate(row.id)
                    }}
                  >
                    حذف
                  </ActionButton>
                </div>
              ) : (
                '—'
              ),
          },
        ]}
      />

      <ManagementFormModal
        open={open}
        title={editing ? 'تعديل كفاءة' : 'إضافة كفاءة'}
        onClose={() => setOpen(false)}
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          saveMutation.mutate()
        }}
        isSubmitting={saveMutation.isPending}
      >
        <Field label="القسم">
          <select className={inputClassName} value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} required>
            <option value="">اختر قسماً</option>
            {(lookupsQuery.data?.departments ?? []).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>
        <Field label="الرمز">
          <input className={inputClassName} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </Field>
        <Field label="الاسم">
          <input className={inputClassName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="الوصف">
          <textarea className={`${inputClassName} min-h-24`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="الوزن">
            <input className={inputClassName} type="number" min="0" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </Field>
          <Field label="حد النجاح">
            <input className={inputClassName} type="number" min="0" max="100" value={form.success_threshold} onChange={(e) => setForm({ ...form, success_threshold: e.target.value })} />
          </Field>
          <Field label="الترتيب">
            <input className={inputClassName} type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          الكفاءة نشطة
        </label>
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </ManagementFormModal>
    </>
  )
}
