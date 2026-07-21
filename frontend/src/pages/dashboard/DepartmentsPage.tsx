import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  fetchLookups,
  type DepartmentRecord,
  updateDepartment,
} from '../../api/management'
import { ActionButton, Field, inputClassName, ManagementFormModal } from '../../components/management/ManagementFormModal'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'

const emptyForm = () => ({
  academy_id: '',
  code: '',
  name: '',
  description: '',
  sort_order: '0',
  is_active: true,
})

export default function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<DepartmentRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const departmentsQuery = useQuery({
    queryKey: ['management', 'departments'],
    queryFn: fetchDepartments,
  })

  const lookupsQuery = useQuery({
    queryKey: ['management', 'lookups'],
    queryFn: fetchLookups,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        academy_id: Number(form.academy_id),
        code: form.code,
        name: form.name,
        description: form.description || null,
        sort_order: Number(form.sort_order || 0),
        is_active: form.is_active,
      }
      return editing ? updateDepartment(editing.id, payload) : createDepartment(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'departments'] })
      await queryClient.invalidateQueries({ queryKey: ['management', 'lookups'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
      setError(null)
    },
    onError: () => setError('تعذر حفظ القسم.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'departments'] })
      await queryClient.invalidateQueries({ queryKey: ['management', 'lookups'] })
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  function openEdit(row: DepartmentRecord) {
    setEditing(row)
    setForm({
      academy_id: String(row.academy_id || row.academy?.id || ''),
      code: row.code,
      name: row.name,
      description: row.description ?? '',
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
        title="الأقسام"
        description="أضف الأقسام واربطها بالأكاديميات للتحكم في هيكل التدريب."
        rows={departmentsQuery.data?.data ?? []}
        totalCount={departmentsQuery.data?.total}
        isLoading={departmentsQuery.isLoading}
        emptyMessage="لا توجد أقسام بعد."
        actions={<ActionButton onClick={openCreate}>إضافة قسم</ActionButton>}
        columns={[
          { header: 'الرمز', cell: (row) => row.code },
          { header: 'الاسم', cell: (row) => row.name },
          { header: 'الأكاديمية', cell: (row) => row.academy?.name ?? '—' },
          { header: 'الكفاءات', cell: (row) => row.competencies_count ?? 0 },
          { header: 'الحالة', cell: (row) => (row.is_active ? 'نشط' : 'متوقف') },
          {
            header: 'إجراءات',
            cell: (row) => (
              <div className="flex flex-wrap gap-2">
                <ActionButton variant="ghost" onClick={() => openEdit(row)}>تعديل</ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('هل تريد حذف هذا القسم؟')) deleteMutation.mutate(row.id)
                  }}
                >
                  حذف
                </ActionButton>
              </div>
            ),
          },
        ]}
      />

      <ManagementFormModal
        open={open}
        title={editing ? 'تعديل قسم' : 'إضافة قسم'}
        onClose={() => setOpen(false)}
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          saveMutation.mutate()
        }}
        isSubmitting={saveMutation.isPending}
      >
        <Field label="الأكاديمية">
          <select className={inputClassName} value={form.academy_id} onChange={(e) => setForm({ ...form, academy_id: e.target.value })} required>
            <option value="">اختر أكاديمية</option>
            {(lookupsQuery.data?.academies ?? []).map((item) => (
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
        <Field label="الترتيب">
          <input className={inputClassName} type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          القسم نشط
        </label>
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </ManagementFormModal>
    </>
  )
}
