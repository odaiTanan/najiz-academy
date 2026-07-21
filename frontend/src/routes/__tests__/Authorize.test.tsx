import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAuthStore } from '../../store/auth'
import { Authorize } from '../Authorize'

describe('Authorize', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('renders children when the user has the required role', () => {
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

    render(
      <MemoryRouter>
        <Authorize allowedRoles={['System Administrator']}>
          <div>Authorized</div>
        </Authorize>
      </MemoryRouter>,
    )

    expect(screen.getByText('Authorized')).toBeInTheDocument()
  })

  it('redirects unauthorized users to the forbidden page', () => {
    useAuthStore.setState({
      user: {
        id: 2,
        name: 'User',
        email: 'user@example.com',
        roles: [{ id: 2, name: 'viewer', permissions: ['view-dashboard'] }],
        permissions: ['view-dashboard'],
      },
      accessToken: 'token',
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Authorize allowedPermissions={['manage-users']}>
          <div>Denied</div>
        </Authorize>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Denied')).not.toBeInTheDocument()
  })
})