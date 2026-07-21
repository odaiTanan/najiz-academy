import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createQuestion,
  deleteQuestion,
  fetchLookups,
  fetchQuestions,
  type QuestionOptionRecord,
  type QuestionRecord,
  updateQuestion,
} from '../../api/management'
import { ActionButton, Field, inputClassName, ManagementFormModal } from '../../components/management/ManagementFormModal'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'
import { useAuthStore } from '../../store/auth'

const questionTypes = [
  { value: 'multiple_choice', label: 'اختيار من متعدد' },
  { value: 'scenario_based', label: 'سيناريو' },
  { value: 'simulation', label: 'محاكاة' },
]

type QuestionFormState = {
  code: string
  prompt: string
  question_type: string
  department_id: string
  competency_id: string
  max_score: string
  time_limit_seconds: string
  is_active: boolean
  options: QuestionOptionRecord[]
}

const emptyForm = (): QuestionFormState => ({
  code: '',
  prompt: '',
  question_type: 'multiple_choice',
  department_id: '',
  competency_id: '',
  max_score: '1',
  time_limit_seconds: '',
  is_active: true,
  options: [
    { label: '', is_correct: true, score_value: 1 },
    { label: '', is_correct: false, score_value: 0 },
  ],
})

function typeLabel(type: string) {
  return questionTypes.find((item) => item.value === type)?.label ?? type
}

export default function QuestionBankPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const canManage = user?.roles.some((role) => ['System Administrator', 'HR Manager'].includes(role.name)) ?? false

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<QuestionRecord | null>(null)
  const [form, setForm] = useState<QuestionFormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const questionsQuery = useQuery({
    queryKey: ['management', 'questions'],
    queryFn: fetchQuestions,
  })

  const lookupsQuery = useQuery({
    queryKey: ['management', 'lookups'],
    queryFn: fetchLookups,
    enabled: canManage,
  })

  const filteredCompetencies = useMemo(() => {
    const competencies = lookupsQuery.data?.competencies ?? []
    if (!form.department_id) return competencies
    return competencies.filter((item) => String(item.department_id) === form.department_id)
  }, [form.department_id, lookupsQuery.data?.competencies])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code,
        prompt: form.prompt,
        question_type: form.question_type,
        department_id: form.department_id ? Number(form.department_id) : null,
        competency_id: form.competency_id ? Number(form.competency_id) : null,
        max_score: Number(form.max_score || 1),
        time_limit_seconds: form.time_limit_seconds ? Number(form.time_limit_seconds) : null,
        is_active: form.is_active,
        options: form.options.filter((option) => option.label.trim()),
      }

      if (editing) {
        return updateQuestion(editing.id, payload)
      }

      return createQuestion(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'questions'] })
      await queryClient.invalidateQueries({ queryKey: ['management', 'lookups'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm())
      setError(null)
    },
    onError: () => setError('تعذر حفظ السؤال. تحقق من البيانات وحاول مرة أخرى.'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['management', 'questions'] })
    },
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setError(null)
    setOpen(true)
  }

  function openEdit(row: QuestionRecord) {
    setEditing(row)
    setForm({
      code: row.code,
      prompt: row.prompt,
      question_type: row.question_type,
      department_id: row.department_id ? String(row.department_id) : row.department?.id ? String(row.department.id) : '',
      competency_id: row.competency_id ? String(row.competency_id) : row.competency?.id ? String(row.competency.id) : '',
      max_score: String(row.max_score ?? 1),
      time_limit_seconds: row.time_limit_seconds ? String(row.time_limit_seconds) : '',
      is_active: row.is_active,
      options:
        row.options && row.options.length
          ? row.options.map((option) => ({
              label: option.label,
              code: option.code,
              is_correct: option.is_correct,
              score_value: option.score_value ?? 0,
            }))
          : emptyForm().options,
    })
    setError(null)
    setOpen(true)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    saveMutation.mutate()
  }

  return (
    <>
      <ManagementTablePage
        eyebrow="إدارة المحتوى"
        title="بنك الأسئلة"
        description="أضف الأسئلة ونظمها حسب القسم والكفاءة، وحدد الخيارات الصحيحة لاستخدامها في الاختبارات."
        rows={questionsQuery.data?.data ?? []}
        totalCount={questionsQuery.data?.total}
        isLoading={questionsQuery.isLoading}
        emptyMessage="لا توجد أسئلة بعد. ابدأ بإضافة سؤال جديد."
        actions={
          canManage ? (
            <ActionButton onClick={openCreate}>إضافة سؤال</ActionButton>
          ) : null
        }
        columns={[
          { header: 'الرمز', cell: (row) => row.code },
          { header: 'نص السؤال', cell: (row) => <span className="line-clamp-2 max-w-md">{row.prompt}</span> },
          { header: 'النوع', cell: (row) => typeLabel(row.question_type) },
          { header: 'الكفاءة', cell: (row) => row.competency?.name ?? 'غير مرتبط' },
          { header: 'الدرجة', cell: (row) => row.max_score },
          { header: 'الخيارات', cell: (row) => row.options_count ?? row.options?.length ?? 0 },
          {
            header: 'إجراءات',
            cell: (row) =>
              canManage ? (
                <div className="flex flex-wrap gap-2">
                  <ActionButton variant="ghost" onClick={() => openEdit(row)}>
                    تعديل
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() => {
                      if (window.confirm('هل تريد حذف هذا السؤال؟')) {
                        deleteMutation.mutate(row.id)
                      }
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
        title={editing ? 'تعديل سؤال' : 'إضافة سؤال'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رمز السؤال">
            <input className={inputClassName} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </Field>
          <Field label="نوع السؤال">
            <select className={inputClassName} value={form.question_type} onChange={(e) => setForm({ ...form, question_type: e.target.value })}>
              {questionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="القسم">
            <select className={inputClassName} value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value, competency_id: '' })}>
              <option value="">بدون قسم</option>
              {(lookupsQuery.data?.departments ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الكفاءة">
            <select className={inputClassName} value={form.competency_id} onChange={(e) => setForm({ ...form, competency_id: e.target.value })}>
              <option value="">بدون كفاءة</option>
              {filteredCompetencies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الدرجة القصوى">
            <input className={inputClassName} type="number" min="0" step="0.1" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} />
          </Field>
          <Field label="الوقت بالثواني (اختياري)">
            <input className={inputClassName} type="number" min="0" value={form.time_limit_seconds} onChange={(e) => setForm({ ...form, time_limit_seconds: e.target.value })} />
          </Field>
        </div>

        <Field label="نص السؤال">
          <textarea className={`${inputClassName} min-h-28`} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} required />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          السؤال نشط
        </label>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">خيارات الإجابة</p>
            <ActionButton
              variant="ghost"
              onClick={() => setForm({ ...form, options: [...form.options, { label: '', is_correct: false, score_value: 0 }] })}
            >
              إضافة خيار
            </ActionButton>
          </div>
          {form.options.map((option, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <input
                className={inputClassName}
                placeholder={`الخيار ${index + 1}`}
                value={option.label}
                onChange={(e) => {
                  const options = [...form.options]
                  options[index] = { ...options[index], label: e.target.value }
                  setForm({ ...form, options })
                }}
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={option.is_correct}
                  onChange={(e) => {
                    const options = form.options.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, is_correct: e.target.checked } : item,
                    )
                    setForm({ ...form, options })
                  }}
                />
                صحيح
              </label>
              <ActionButton
                variant="danger"
                onClick={() => setForm({ ...form, options: form.options.filter((_, itemIndex) => itemIndex !== index) })}
              >
                حذف
              </ActionButton>
            </div>
          ))}
        </div>

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      </ManagementFormModal>
    </>
  )
}
