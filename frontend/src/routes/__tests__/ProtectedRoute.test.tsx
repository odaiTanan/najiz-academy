import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAuthStore } from '../../store/auth'
import { jest } from '@jest/globals'

const useUserSessionMock = jest.fn()

jest.unstable_mockModule('../../hooks/useUserSession', () => ({
  useUserSession: useUserSessionMock,
}))

const { useUserSession } = await import('../../hooks/useUserSession')
const { ProtectedRoute } = await import('../ProtectedRoute')

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('shows loading state while restoring the session', () => {
    useUserSessionMock.mockReturnValue({
      isLoading: true,
      isError: false,
      data: null,
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Restoring your session...')).toBeInTheDocument()
  })

  it('renders children when the auth store already has a token', () => {
    useAuthStore.setState({
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        roles: [{ id: 1, name: 'System Administrator', permissions: ['view-dashboard'] }],
        permissions: ['view-dashboard'],
      },
      accessToken: 'token',
    })

    useUserSessionMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { id: 1 },
    })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Secret')).toBeInTheDocument()
  })
})