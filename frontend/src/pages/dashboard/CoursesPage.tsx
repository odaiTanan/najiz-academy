import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCourse,
  deleteCourse,
  fetchCourses,
  fetchLookups,
  type CourseRecord,
  updateCourse,
} from '../../api/management'
import { ActionButton, Field, inputClassName, ManagementFormModal } from '../../components/management/ManagementFormModal'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'
import { useAuthStore } from '../../store/auth'

const difficultyLabels: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
}

const emptyForm = () => ({
  academy_id: '',
  code: '',
  name: '',
  description: '',
  duration_minutes: '60',
  difficulty: 'beginner',
  is_active: true,
})

export default function CoursesPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const canManage = user?.roles.some((role) => ['System Administrator', 'HR Manager', 'Trainer'].includes(role.name)) ?? false

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CourseRecord | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const coursesQuery = useQuery({
    queryKey: ['management', 'courses'],
    queryFn: fetchCourses,
  })

  const lookupsQuery = useQuery({
    queryKey: ['management', 'lookups'],
    queryFn: fetchLookups,
    enabled: canManage,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        academy_id: form.academy_id ? Number(form.academy_id) : null,
        code: form.code,
        name: form.name,
        description: form.description || null,
        duration_minutes: Number(form.duration_minutes || 0),
        difficulty: form.difficulty,
        is_active: form.is_active,
      }
      return editing ? updateCourse(editing.id, payload) : createCourse(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'courses'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
      setError(null)
    },
    onError: () => setError('تعذر حفظ الدورة.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'courses'] })
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  function openEdit(row: CourseRecord) {
    setEditing(row)
    setForm({
      academy_id: row.academy_id ? String(row.academy_id) : row.academy?.id ? String(row.academy.id) : '',
      code: row.code,
      name: row.name,
      description: row.description ?? '',
      duration_minutes: String(row.duration_minutes ?? 60),
      difficulty: row.difficulty,
      is_active: row.is_active,
    })
    setError(null)
    setOpen(true)
  }

  return (
    <>
      <ManagementTablePage
        eyebrow="إدارة المحتوى"
        title="الدورات"
        description="أضف الدورات التدريبية وتحكّم بمستواها ومدتها وربطها بالأكاديميات."
        rows={coursesQuery.data?.data ?? []}
        totalCount={coursesQuery.data?.total}
        isLoading={coursesQuery.isLoading}
        emptyMessage="لا توجد دورات بعد."
        actions={canManage ? <ActionButton onClick={openCreate}>إضافة دورة</ActionButton> : null}
        columns={[
          { header: 'الرمز', cell: (row) => row.code },
          { header: 'الاسم', cell: (row) => row.name },
          { header: 'الأكاديمية', cell: (row) => row.academy?.name ?? '—' },
          { header: 'المستوى', cell: (row) => difficultyLabels[row.difficulty] ?? row.difficulty },
          { header: 'المدة', cell: (row) => `${row.duration_minutes ?? 0} دقيقة` },
          { header: 'الحالة', cell: (row) => (row.is_active ? 'نشطة' : 'متوقفة') },
          {
            header: 'إجراءات',
            cell: (row) =>
              canManage ? (
                <div className="flex flex-wrap gap-2">
                  <ActionButton variant="ghost" onClick={() => openEdit(row)}>تعديل</ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() => {
                      if (window.confirm('هل تريد حذف هذه الدورة؟')) deleteMutation.mutate(row.id)
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
        title={editing ? 'تعديل دورة' : 'إضافة دورة'}
        onClose={() => setOpen(false)}
        onSubmit={(event: FormEvent) => {
          event.preventDefault()
          saveMutation.mutate()
        }}
        isSubmitting={saveMutation.isPending}
      >
        <Field label="الأكاديمية">
          <select className={inputClassName} value={form.academy_id} onChange={(e) => setForm({ ...form, academy_id: e.target.value })}>
            <option value="">بدون أكاديمية</option>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="المدة بالدقائق">
            <input className={inputClassName} type="number" min="0" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </Field>
          <Field label="المستوى">
            <select className={inputClassName} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          الدورة نشطة
        </label>
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </ManagementFormModal>
    </>
  )
}
