import { useQuery } from '@tanstack/react-query'

import { fetchAuditLogs } from '../../api/management'
import { ManagementTablePage } from '../../components/management/ManagementTablePage'

export default function AuditLogsPage() {
  const auditLogsQuery = useQuery({
    queryKey: ['management', 'audit-logs'],
    queryFn: fetchAuditLogs,
  })

  return (
    <ManagementTablePage
      eyebrow="الأمان"
      title="سجل التدقيق"
      description="سجل نشاط النظام للمراجعة والامتثال واستكشاف الأخطاء."
      rows={auditLogsQuery.data?.data ?? []}
      totalCount={auditLogsQuery.data?.total}
      isLoading={auditLogsQuery.isLoading}
      emptyMessage="لا توجد أحداث تدقيق بعد."
      columns={[
        { header: 'الإجراء', cell: (row) => row.action },
        { header: 'الحدث', cell: (row) => row.event ?? '—' },
        { header: 'المنفذ', cell: (row) => row.user?.name ?? 'النظام' },
        { header: 'الهدف', cell: (row) => `${row.auditable_type} #${row.auditable_id}` },
        { header: 'IP', cell: (row) => row.ip_address ?? '—' },
      ]}
    />
  )
}
