import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAcademy,
  deleteAcademy,
  fetchAcademies,
  type AcademyRecord,
  updateAcademy,
} from '../../api/management'
import { ActionButton, Field, inputClassName, ManagementFormModal } from '../../components/management/ManagementFormModal'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'

const emptyForm = () => ({ code: '', name: '', description: '', status: 'active' })

export default function AcademiesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AcademyRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const academiesQuery = useQuery({
    queryKey: ['management', 'academies'],
    queryFn: fetchAcademies,
  })

  const saveMutation = useMutation({
    mutationFn: async () => (editing ? updateAcademy(editing.id, form) : createAcademy(form)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'academies'] })
      await queryClient.invalidateQueries({ queryKey: ['management', 'lookups'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
      setError(null)
    },
    onError: () => setError('تعذر حفظ الأكاديمية.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAcademy,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'academies'] })
      await queryClient.invalidateQueries({ queryKey: ['management', 'lookups'] })
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  function openEdit(row: AcademyRecord) {
    setEditing(row)
    setForm({
      code: row.code,
      name: row.name,
      description: row.description ?? '',
      status: row.status,
    })
    setError(null)
    setOpen(true)
  }

  return (
    <>
      <ManagementTablePage
        eyebrow="إدارة المحتوى"
        title="الأكاديميات"
        description="أضف الأكاديميات وتحكّم بحالتها وربطها بالأقسام والدورات."
        rows={academiesQuery.data?.data ?? []}
        totalCount={academiesQuery.data?.total}
        isLoading={academiesQuery.isLoading}
        emptyMessage="لا توجد أكاديميات بعد."
        actions={<ActionButton onClick={openCreate}>إضافة أكاديمية</ActionButton>}
        columns={[
          { header: 'الرمز', cell: (row) => row.code },
          { header: 'الاسم', cell: (row) => row.name },
          { header: 'الحالة', cell: (row) => (row.status === 'active' ? 'نشطة' : row.status) },
          { header: 'الأقسام', cell: (row) => row.departments_count ?? 0 },
          { header: 'الدورات', cell: (row) => row.courses_count ?? 0 },
          {
            header: 'إجراءات',
            cell: (row) => (
              <div className="flex flex-wrap gap-2">
                <ActionButton variant="ghost" onClick={() => openEdit(row)}>تعديل</ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('هل تريد حذف هذه الأكاديمية؟')) deleteMutation.mutate(row.id)
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
        title={editing ? 'تعديل أكاديمية' : 'إضافة أكاديمية'}
        onClose={() => setOpen(false)}
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          saveMutation.mutate()
        }}
        isSubmitting={saveMutation.isPending}
      >
        <Field label="الرمز">
          <input className={inputClassName} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </Field>
        <Field label="الاسم">
          <input className={inputClassName} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="الوصف">
          <textarea className={`${inputClassName} min-h-24`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="الحالة">
          <select className={inputClassName} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">نشطة</option>
            <option value="inactive">متوقفة</option>
          </select>
        </Field>
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </ManagementFormModal>
    </>
  )
}
