export type PermissionName = string

export interface RoleRecord {
  id: number
  name: string
  permissions: PermissionName[]
}

export interface AuthUser {
  id: number
  name: string
  email: string
  roles: RoleRecord[]
  permissions: PermissionName[]
}

export interface AuthSession {
  accessToken: string
  tokenType: 'Bearer'
  accessTokenExpiresAt: string | null
  user: AuthUser
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  setSession: (session: AuthSession) => void
  setAccessToken: (accessToken: string | null) => void
  setUser: (user: AuthUser | null) => void
  clearSession: () => void
}