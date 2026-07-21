import { jest } from '@jest/globals'
import MockAdapter from 'axios-mock-adapter'

import { axiosInstance, refreshAxiosInstance, setAuthRedirectHandler } from '../axios'
import { API_ROUTES } from '../routes'
import { useAuthStore } from '../../store/auth'

describe('axios auth refresh queue', () => {
  const mock = new MockAdapter(axiosInstance)
  const refreshMock = new MockAdapter(refreshAxiosInstance)

  beforeEach(() => {
    mock.reset()
    refreshMock.reset()
    useAuthStore.getState().clearSession()
    setAuthRedirectHandler(jest.fn())
  })

  it('refreshes once for concurrent 401 responses and retries the original requests', async () => {
    useAuthStore.setState({
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        roles: [{ id: 1, name: 'System Administrator', permissions: ['view-dashboard'] }],
        permissions: ['view-dashboard'],
      },
      accessToken: 'expired-token',
    })

    let dashboardHits = 0

    mock.onGet(API_ROUTES.DASHBOARD.INDEX).reply(() => {
      dashboardHits += 1

      if (dashboardHits <= 2) {
        return [401, { message: 'Unauthorized' }]
      }

      return [200, { message: 'ok' }]
    })

    refreshMock.onPost(API_ROUTES.AUTH.REFRESH).reply(200, {
      access_token: 'new-token',
      token_type: 'Bearer',
      access_token_expires_at: null,
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        roles: [{ id: 1, name: 'System Administrator', permissions: ['view-dashboard'] }],
        permissions: ['view-dashboard'],
      },
    })

    const [first, second] = await Promise.all([
      axiosInstance.get(API_ROUTES.DASHBOARD.INDEX),
      axiosInstance.get(API_ROUTES.DASHBOARD.INDEX),
    ])

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(refreshMock.history.post.filter((request) => request.url === API_ROUTES.AUTH.REFRESH)).toHaveLength(1)
    expect(useAuthStore.getState().accessToken).toBe('new-token')
  })
})