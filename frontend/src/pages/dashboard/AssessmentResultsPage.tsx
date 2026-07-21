import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { axiosInstance } from '../../api/axios'
import { API_ROUTES } from '../../api/routes'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuthStore } from '../../store/auth'

interface Attempt {
  id: number
  user: { id: number; name: string; email: string }
  assessment: { id: number; title: string; code: string }
  total_score: number
  status: string
  submitted_at: string
  result_summary: {
    overall_score: number
    passing_score: number
    competencies: Array<{
      competency_name: string
      earned_score: number
      max_score: number
      competency_score: number
      threshold: number
      is_passing: boolean
    }>
    questions: Array<{
      question_id: number
      earned_score: number
      max_score: number
      is_correct: boolean
      answer: any
    }>
  }
}

export default function AssessmentResultsPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((state) => state.user)
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null)

  const canView = user?.roles.some((role) => ['System Administrator', 'HR Manager', 'Trainer'].includes(role.name)) ?? false

  const attemptsQuery = useQuery({
    queryKey: ['assessment-attempts', id],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: Attempt[] }>(API_ROUTES.ASSESSMENTS.ATTEMPTS(Number(id)))
      return response.data.data
    },
    enabled: canView && !!id,
  })

  const attemptDetailsQuery = useQuery({
    queryKey: ['attempt-details', selectedAttempt?.id],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: Attempt }>(API_ROUTES.ASSESSMENTS.ATTEMPT_DETAILS(selectedAttempt!.id))
      return response.data.data
    },
    enabled: !!selectedAttempt,
  })

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          ليس لديك صلاحية لعرض نتائج الاختبارات.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">نتائج الاختبار</h1>
          <p className="mt-2 text-slate-600">عرض وتحليل نتائج محاولات الاختبار</p>
        </div>
        <Link
          to="/dashboard/assessments"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          العودة للاختبارات
        </Link>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>المحاولات المكتملة</CardTitle>
        </CardHeader>
        <CardContent>
          {attemptsQuery.isLoading ? (
            <p className="text-slate-500">جاري التحميل...</p>
          ) : attemptsQuery.data?.length === 0 ? (
            <p className="text-slate-500">لا توجد محاولات مكتملة لهذا الاختبار.</p>
          ) : (
            <div className="space-y-3">
              {attemptsQuery.data?.map((attempt) => (
                <div
                  key={attempt.id}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100"
                  onClick={() => setSelectedAttempt(attempt)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{attempt.user?.name ?? 'غير معروف'}</p>
                      <p className="text-sm text-slate-600">{attempt.user?.email ?? ''}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-semibold text-slate-900">{attempt.total_score ?? 0}%</p>
                      <p className="text-xs text-slate-500">
                        {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString('ar-SA') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAttempt && attemptDetailsQuery.data && attemptDetailsQuery.data.result_summary && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>تفاصيل المحاولة</CardTitle>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                إغلاق
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الدرجة الكلية</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {attemptDetailsQuery.data.result_summary?.overall_score ?? 0}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">درجة النجاح</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {attemptDetailsQuery.data.result_summary?.passing_score ?? 0}%
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">الحالة</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {(attemptDetailsQuery.data.result_summary?.overall_score ?? 0) >=
                  (attemptDetailsQuery.data.result_summary?.passing_score ?? 0)
                    ? 'ناجح'
                    : 'راسب'}
                </p>
              </div>
            </div>

            {attemptDetailsQuery.data.result_summary?.competencies && attemptDetailsQuery.data.result_summary.competencies.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">التفاصيل حسب الكفاءة</h3>
                <div className="space-y-3">
                  {attemptDetailsQuery.data.result_summary.competencies.filter(Boolean).map((competency, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{competency?.competency_name ?? 'غير معروف'}</p>
                        <p
                          className={`text-sm font-semibold ${
                            (competency?.is_passing ?? false) ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {competency?.competency_score ?? 0}% (الحد الأدنى: {competency?.threshold ?? 0}%)
                        </p>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            (competency?.is_passing ?? false) ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${competency?.competency_score ?? 0}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        الدرجة: {competency?.earned_score ?? 0} / {competency?.max_score ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {attemptDetailsQuery.data.result_summary?.questions && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">الإجابات على الأسئلة</h3>
                <div className="space-y-4">
                  {attemptDetailsQuery.data.result_summary.questions.map((question, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">السؤال #{question.question_id}</p>
                        <p
                          className={`text-sm font-semibold ${
                            question.is_correct ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {question.is_correct ? 'صحيح' : 'خاطئ'}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        الدرجة: {question.earned_score} / {question.max_score}
                      </p>
                      <div className="mt-3 rounded-lg bg-slate-100 p-3">
                        <p className="text-xs text-slate-500 mb-1">إجابة المستخدم:</p>
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                          {JSON.stringify(question.answer, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
