import { axiosInstance } from './axios'
import { API_ROUTES } from './routes'
import type { AuthSession, AuthUser } from '../types/auth'

export interface LoginPayload {
  email: string
  password: string
}

interface ApiAuthResponse {
  access_token: string
  token_type: 'Bearer'
  access_token_expires_at: string | null
  user: { data: AuthUser } | AuthUser
}

interface ApiMeResponse {
  user: { data: AuthUser } | AuthUser
}

function normalizeUser(payload: ApiAuthResponse['user']): AuthUser {
  return 'data' in payload ? payload.data : payload
}

export async function loginRequest(payload: LoginPayload): Promise<AuthSession> {
  const response = await axiosInstance.post<ApiAuthResponse>(API_ROUTES.AUTH.LOGIN, payload)

  return {
    accessToken: response.data.access_token,
    tokenType: response.data.token_type,
    accessTokenExpiresAt: response.data.access_token_expires_at,
    user: normalizeUser(response.data.user),
  }
}

export async function logoutRequest(): Promise<void> {
  await axiosInstance.post(API_ROUTES.AUTH.LOGOUT)
}

export async function fetchSessionRequest(): Promise<AuthUser> {
  const response = await axiosInstance.get<ApiMeResponse>(API_ROUTES.AUTH.ME)

  return normalizeUser(response.data.user)
}