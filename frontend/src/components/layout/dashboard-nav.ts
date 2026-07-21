export type NavItem = {
  label: string
  href: string
  roles?: string[]
  permissions?: string[]
}

export const dashboardNavigation: NavItem[] = [
  { label: 'نظرة عامة', href: '/dashboard' },
  { label: 'الأكاديميات', href: '/dashboard/academies', roles: ['System Administrator', 'HR Manager'] },
  { label: 'الأقسام', href: '/dashboard/departments', roles: ['System Administrator', 'HR Manager'] },
  { label: 'الكفاءات', href: '/dashboard/competencies', roles: ['System Administrator', 'HR Manager', 'Trainer'] },
  { label: 'بنك الأسئلة', href: '/dashboard/questions', roles: ['System Administrator', 'HR Manager'] },
  { label: 'الاختبارات', href: '/dashboard/assessments', roles: ['System Administrator', 'HR Manager', 'Trainer', 'Employee', 'Candidate'] },
  { label: 'نتائج الاختبارات', href: '/dashboard/results', roles: ['System Administrator', 'HR Manager', 'Trainer'] },
  { label: 'خطط التدريب', href: '/dashboard/training-plans', roles: ['System Administrator', 'HR Manager', 'Trainer'] },
  { label: 'الدورات', href: '/dashboard/courses', roles: ['System Administrator', 'HR Manager', 'Trainer'] },
  { label: 'الشهادات', href: '/dashboard/certificates', roles: ['System Administrator', 'HR Manager', 'Trainer', 'Candidate', 'Employee'] },
  { label: 'سجل التدقيق', href: '/dashboard/audit-logs', roles: ['System Administrator'] },
]
