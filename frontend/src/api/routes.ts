export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  MANAGEMENT: {
    LOOKUPS: '/dashboard/lookups',
    ACADEMIES: '/dashboard/academies',
    DEPARTMENTS: '/dashboard/departments',
    COMPETENCIES: '/dashboard/competencies',
    QUESTIONS: '/dashboard/questions',
    ASSESSMENTS: '/dashboard/assessments',
    TRAINING_PLANS: '/dashboard/training-plans',
    COURSES: '/dashboard/courses',
    CERTIFICATES: '/dashboard/certificates',
    AUDIT_LOGS: '/dashboard/audit-logs',
  },
  ASSESSMENTS: {
    BY_ID: (assessmentId: number) => `/assessments/${assessmentId}`,
    AUTO_SAVE: '/assessments/auto-save',
    SUBMIT: (attemptId: number) => `/assessments/${attemptId}/submit`,
    ATTEMPTS: (assessmentId: number) => `/assessments/${assessmentId}/attempts`,
    ATTEMPT_DETAILS: (attemptId: number) => `/assessments/attempts/${attemptId}`,
  },
  DASHBOARD: {
    INDEX: '/dashboard',
  },
} as const
