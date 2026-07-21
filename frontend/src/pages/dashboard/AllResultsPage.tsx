import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { axiosInstance } from '../../api/axios'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuthStore } from '../../store/auth'

interface Assessment {
  id: number
  code: string
  title: string
  status: string
  items_count?: number
}

export default function AllResultsPage() {
  const user = useAuthStore((state) => state.user)
  const canView = user?.roles.some((role) => ['System Administrator', 'HR Manager', 'Trainer'].includes(role.name)) ?? false

  const assessmentsQuery = useQuery({
    queryKey: ['management', 'assessments'],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: Assessment[] }>('/dashboard/assessments')
      return response.data.data ?? []
    },
    enabled: canView,
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
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">نتائج الاختبارات</h1>
        <p className="mt-2 text-slate-600">اختر اختباراً لعرض نتائجه وتفاصيل المحاولات</p>
      </div>

      {assessmentsQuery.isLoading ? (
        <p className="text-slate-500">جاري التحميل...</p>
      ) : assessmentsQuery.data?.length === 0 ? (
        <p className="text-slate-500">لا توجد اختبارات متاحة.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessmentsQuery.data?.map((assessment) => (
            <Card key={assessment.id} className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-lg">{assessment.title}</CardTitle>
                <p className="text-sm text-slate-500">{assessment.code}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-slate-600">عدد الأسئلة: {assessment.items_count ?? 0}</p>
                  <p className="text-sm text-slate-600">الحالة: {assessment.status}</p>
                </div>
                <Link
                  to={`/dashboard/assessments/${assessment.id}/results`}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  عرض النتائج
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
