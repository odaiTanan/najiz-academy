import { useQuery } from '@tanstack/react-query'

import { fetchTrainingPlans } from '../../api/management'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'

export default function TrainingPlansPage() {
  const trainingPlansQuery = useQuery({
    queryKey: ['management', 'training-plans'],
    queryFn: fetchTrainingPlans,
  })

  return (
    <ManagementTablePage
      eyebrow="التدريب"
      title="خطط التدريب"
      description="خطط التطوير المولَّدة تلقائياً من نتائج الاختبارات وفجوات الكفاءات."
      rows={trainingPlansQuery.data?.data ?? []}
      totalCount={trainingPlansQuery.data?.total}
      isLoading={trainingPlansQuery.isLoading}
      emptyMessage="لا توجد خطط تدريب بعد."
      columns={[
        { header: 'المستخدم', cell: (row) => row.user?.name ?? 'غير معروف' },
        { header: 'الحالة', cell: (row) => row.status },
        { header: 'تاريخ الإنشاء', cell: (row) => row.generated_at ?? 'قيد الانتظار' },
        { header: 'العناصر', cell: (row) => row.items_count },
        { header: 'الإكمال', cell: (row) => row.completed_at ?? 'قيد التنفيذ' },
      ]}
    />
  )
}
