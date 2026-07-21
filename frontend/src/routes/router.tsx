import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'

import AppLayout from '../components/AppLayout'
import DashboardLayout from '../components/layout/DashboardLayout'
import { AssessmentScreen } from '../components/Assessment/AssessmentScreen'
import AcademiesPage from '../pages/dashboard/AcademiesPage'
import AllResultsPage from '../pages/dashboard/AllResultsPage'
import AssessmentResultsPage from '../pages/dashboard/AssessmentResultsPage'
import AuditLogsPage from '../pages/dashboard/AuditLogsPage'
import CertificatesPage from '../pages/dashboard/CertificatesPage'
import CompetenciesPage from '../pages/dashboard/CompetenciesPage'
import CoursesPage from '../pages/dashboard/CoursesPage'
import DepartmentsPage from '../pages/dashboard/DepartmentsPage'
import DashboardPage from '../pages/DashboardPage'
import ForbiddenPage from '../pages/ForbiddenPage'
import LoginPage from '../pages/LoginPage'
import AssessmentsPage from '../pages/dashboard/AssessmentsPage'
import QuestionBankPage from '../pages/dashboard/QuestionBankPage'
import TrainingPlansPage from '../pages/dashboard/TrainingPlansPage'
import { Authorize } from './Authorize'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer', 'Candidate', 'Employee']} allowedPermissions={['view-dashboard']}>
                <DashboardPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/academies',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager']}>
                <AcademiesPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/departments',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager']}>
                <DepartmentsPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/competencies',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer']}>
                <CompetenciesPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/questions',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager']}>
                <QuestionBankPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/assessments',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer', 'Employee', 'Candidate']}>
                <AssessmentsPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/assessments/:id/results',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer']}>
                <AssessmentResultsPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/results',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer']}>
                <AllResultsPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/training-plans',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer']}>
                <TrainingPlansPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/courses',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer']}>
                <CoursesPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/certificates',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer', 'Candidate', 'Employee']}>
                <CertificatesPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/audit-logs',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator']}>
                <AuditLogsPage />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'assessments/:assessmentId',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <Authorize allowedRoles={['System Administrator', 'HR Manager', 'Trainer', 'Candidate', 'Employee']}>
                <AssessmentRoute />
              </Authorize>
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
    ],
  },
])

function AssessmentRoute() {
  const { assessmentId } = useParams()

  return <AssessmentScreen assessmentId={Number(assessmentId ?? 0)} />
}