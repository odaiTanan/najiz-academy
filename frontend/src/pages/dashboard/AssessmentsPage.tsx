import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAssessment,
  deleteAssessment,
  fetchAssessment,
  fetchAssessments,
  fetchLookups,
  type AssessmentRecord,
  updateAssessment,
} from '../../api/management'
import { ActionButton, Field, inputClassName, ManagementFormModal } from '../../components/management/ManagementFormModal'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'
import { useAuthStore } from '../../store/auth'

const statusLabels: Record<string, string> = {
  draft: 'مسودة',
  published: 'منشور',
  archived: 'مؤرشف',
}

type AssessmentFormState = {
  code: string
  title: string
  description: string
  academy_id: string
  department_id: string
  duration_minutes: string
  passing_score: string
  status: string
  question_ids: number[]
}

const emptyForm = (): AssessmentFormState => ({
  code: '',
  title: '',
  description: '',
  academy_id: '',
  department_id: '',
  duration_minutes: '30',
  passing_score: '70',
  status: 'draft',
  question_ids: [],
})

export default function AssessmentsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const canManage = user?.roles.some((role) => ['System Administrator', 'HR Manager'].includes(role.name)) ?? false

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AssessmentRecord | null>(null)
  const [form, setForm] = useState<AssessmentFormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const assessmentsQuery = useQuery({
    queryKey: ['management', 'assessments'],
    queryFn: fetchAssessments,
  })

  const lookupsQuery = useQuery({
    queryKey: ['management', 'lookups'],
    queryFn: fetchLookups,
    enabled: canManage,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code,
        title: form.title,
        description: form.description || null,
        academy_id: form.academy_id ? Number(form.academy_id) : null,
        department_id: form.department_id ? Number(form.department_id) : null,
        duration_minutes: Number(form.duration_minutes || 0),
        passing_score: Number(form.passing_score || 70),
        status: form.status,
        published_at: form.status === 'published' ? new Date().toISOString() : null,
        question_ids: form.question_ids,
      }

      if (editing) {
        return updateAssessment(editing.id, payload)
      }

      return createAssessment(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'assessments'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
      setError(null)
    },
    onError: () => setError('تعذر حفظ الاختبار. تحقق من البيانات وحاول مرة أخرى.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAssessment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'assessments'] })
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  async function openEdit(row: AssessmentRecord) {
    setEditing(row)
    setError(null)
    setOpen(true)

    try {
      const full = canManage ? await fetchAssessment(row.id) : row
      setForm({
        code: full.code,
        title: full.title,
        description: full.description ?? '',
        academy_id: full.academy_id ? String(full.academy_id) : full.academy?.id ? String(full.academy.id) : '',
        department_id: full.department_id ? String(full.department_id) : full.department?.id ? String(full.department.id) : '',
        duration_minutes: String(full.duration_minutes ?? 30),
        passing_score: String(full.passing_score ?? 70),
        status: full.status,
        question_ids: full.items?.map((item) => item.id) ?? [],
      })
    } catch {
      setForm({
        code: row.code,
        title: row.title,
        description: row.description ?? '',
        academy_id: row.academy_id ? String(row.academy_id) : row.academy?.id ? String(row.academy.id) : '',
        department_id: row.department_id ? String(row.department_id) : row.department?.id ? String(row.department.id) : '',
        duration_minutes: String(row.duration_minutes ?? 30),
        passing_score: String(row.passing_score ?? 70),
        status: row.status,
        question_ids: row.items?.map((item) => item.id) ?? [],
      })
    }
  }

  function toggleQuestion(questionId: number) {
    setForm((current) => ({
      ...current,
      question_ids: current.question_ids.includes(questionId)
        ? current.question_ids.filter((id) => id !== questionId)
        : [...current.question_ids, questionId],
    }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    saveMutation.mutate()
  }

  return (
    <>
      <ManagementTablePage
        eyebrow="التقييم"
        title="الاختبارات"
        description="أنشئ الاختبارات، اربطها بأسئلة من البنك، وانشرها للمتدربين، أو ادخل لأداء الاختبار مباشرة."
        rows={assessmentsQuery.data?.data ?? []}
        totalCount={assessmentsQuery.data?.total}
        isLoading={assessmentsQuery.isLoading}
        emptyMessage="لا توجد اختبارات بعد."
        actions={canManage ? <ActionButton onClick={openCreate}>إضافة اختبار</ActionButton> : null}
        columns={[
          { header: 'الرمز', cell: (row) => row.code },
          { header: 'العنوان', cell: (row) => row.title },
          { header: 'الحالة', cell: (row) => statusLabels[row.status] ?? row.status },
          { header: 'المدة (دقيقة)', cell: (row) => row.duration_minutes },
          { header: 'درجة النجاح', cell: (row) => row.passing_score },
          { header: 'الأسئلة', cell: (row) => row.items_count ?? row.items?.length ?? 0 },
          {
            header: 'إجراءات',
            cell: (row) => (
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/assessments/${row.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  بدء الاختبار
                </Link>
                {canManage ? (
                  <>
                    <Link
                      to={`/dashboard/assessments/${row.id}/results`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      عرض النتائج
                    </Link>
                    <ActionButton variant="ghost" onClick={() => openEdit(row)}>
                      تعديل
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      onClick={() => {
                        if (window.confirm('هل تريد حذف هذا الاختبار؟')) {
                          deleteMutation.mutate(row.id)
                        }
                      }}
                    >
                      حذف
                    </ActionButton>
                  </>
                ) : null}
              </div>
            ),
          },
        ]}
      />

      <ManagementFormModal
        open={open}
        title={editing ? 'تعديل اختبار' : 'إضافة اختبار'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رمز الاختبار">
            <input className={inputClassName} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </Field>
          <Field label="الحالة">
            <select className={inputClassName} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">مسودة</option>
              <option value="published">منشور</option>
              <option value="archived">مؤرشف</option>
            </select>
          </Field>
          <Field label="الأكاديمية">
            <select className={inputClassName} value={form.academy_id} onChange={(e) => setForm({ ...form, academy_id: e.target.value })}>
              <option value="">بدون أكاديمية</option>
              {(lookupsQuery.data?.academies ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="القسم">
            <select className={inputClassName} value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
              <option value="">بدون قسم</option>
              {(lookupsQuery.data?.departments ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="المدة بالدقائق">
            <input className={inputClassName} type="number" min="0" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </Field>
          <Field label="درجة النجاح">
            <input className={inputClassName} type="number" min="0" max="100" value={form.passing_score} onChange={(e) => setForm({ ...form, passing_score: e.target.value })} />
          </Field>
        </div>

        <Field label="عنوان الاختبار">
          <input className={inputClassName} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </Field>

        <Field label="الوصف">
          <textarea className={`${inputClassName} min-h-24`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">أسئلة الاختبار من البنك</p>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {(lookupsQuery.data?.questions ?? []).map((question) => (
              <label key={question.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.question_ids.includes(question.id)}
                  onChange={() => toggleQuestion(question.id)}
                />
                <span>
                  <span className="font-semibold text-white">{question.code}</span>
                  <span className="mt-1 block line-clamp-2">{question.prompt}</span>
                </span>
              </label>
            ))}
            {!lookupsQuery.data?.questions?.length ? (
              <p className="text-sm text-slate-500">لا توجد أسئلة نشطة في البنك. أضف أسئلة أولاً.</p>
            ) : null}
          </div>
        </div>

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      </ManagementFormModal>
    </>
  )
}
