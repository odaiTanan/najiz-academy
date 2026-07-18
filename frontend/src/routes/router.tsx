import { createBrowserRouter, Navigate } from 'react-router-dom'

import AppLayout from '../components/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import ForbiddenPage from '../pages/ForbiddenPage'
import LoginPage from '../pages/LoginPage'
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
            <Authorize allowedRoles={['admin']} allowedPermissions={['view-dashboard']}>
              <DashboardPage />
            </Authorize>
          </ProtectedRoute>
        ),
      },
    ],
  },
])