import { useQuery } from '@tanstack/react-query'

import { fetchCertificates } from '../../api/management'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'

export default function CertificatesPage() {
  const certificatesQuery = useQuery({
    queryKey: ['management', 'certificates'],
    queryFn: fetchCertificates,
  })

  return (
    <ManagementTablePage
      eyebrow="الشهادات"
      title="سجل الشهادات"
      description="الشهادات الصادرة مع بيانات الحامل وتاريخ الإصدار والانتهاء."
      rows={certificatesQuery.data?.data ?? []}
      totalCount={certificatesQuery.data?.total}
      isLoading={certificatesQuery.isLoading}
      emptyMessage="لا توجد شهادات صادرة بعد."
      columns={[
        { header: 'الرقم', cell: (row) => row.certificate_number },
        { header: 'المالك', cell: (row) => row.user?.name ?? 'غير معروف' },
        { header: 'تاريخ الإصدار', cell: (row) => row.issued_at ?? 'قيد الانتظار' },
        { header: 'تاريخ الانتهاء', cell: (row) => row.expires_at ?? 'بدون انتهاء' },
      ]}
    />
  )
}
