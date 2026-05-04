import { apiService } from '@/services/apiService'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export const authService = {
  login: (credentials: AuthCredentials) =>
    apiService.post<AuthTokens>('/users/login', credentials),

  register: (credentials: AuthCredentials) =>
    apiService.post<AuthTokens>('/users/add', credentials),

  logout: (refreshToken: string) =>
    apiService.post<void>('/users/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    apiService.get<AuthTokens>('/users/refresh', { refreshToken }),
}
