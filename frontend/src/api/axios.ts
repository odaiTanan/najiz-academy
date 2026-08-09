import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { API_ROUTES } from './routes'
import { useAuthStore } from '../store/auth'
import type { AuthSession } from '../types/auth'

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthRefresh?: boolean
}

type RedirectHandler = (path: string) => void

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string> }).env ?? {}
const baseURL = viteEnv.VITE_API_BASE_URL ?? 'https://academy.najizgo.com/api'

const authApi = axios.create({
  baseURL,
  withCredentials: true,
})

const refreshApi = axios.create({
  baseURL,
  withCredentials: true,
})

let refreshInFlight = false
let queuedRequests: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

let redirectHandler: RedirectHandler | null = null

export function setAuthRedirectHandler(handler: RedirectHandler): void {
  redirectHandler = handler
}

function normalizeAuthSession(payload: any): AuthSession {
  return {
    accessToken: payload.access_token ?? payload.accessToken,
    tokenType: (payload.token_type ?? payload.tokenType) as AuthSession['tokenType'],
    accessTokenExpiresAt: payload.access_token_expires_at ?? payload.accessTokenExpiresAt ?? null,
    user: payload.user?.data ?? payload.user,
  }
}

function processQueue(error: unknown, token: string | null): void {
  queuedRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
      return
    }

    resolve(token as string)
  })

  queuedRequests = []
}

authApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh ||
      originalRequest.url?.includes(API_ROUTES.AUTH.REFRESH)
    ) {
      return Promise.reject(error)
    }

    if (refreshInFlight) {
      return new Promise((resolve, reject) => {
        queuedRequests.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            originalRequest._retry = true
            resolve(authApi(originalRequest))
          },
          reject,
        })
      })
    }

    refreshInFlight = true
    originalRequest._retry = true

    try {
      const refreshResponse = await refreshApi.post(API_ROUTES.AUTH.REFRESH, undefined, {
        skipAuthRefresh: true,
      } as RetryableRequestConfig)

      const session = normalizeAuthSession(refreshResponse.data)
      useAuthStore.getState().setSession(session)

      processQueue(null, session.accessToken)

      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`

      return authApi(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().clearSession()
      redirectHandler?.('/login')

      return Promise.reject(refreshError)
    } finally {
      refreshInFlight = false
    }
  },
)

export { authApi as axiosInstance }
export { refreshApi as refreshAxiosInstance }

export function mapAuthSession(payload: any): AuthSession {
  return normalizeAuthSession(payload)
}