import axios, { type AxiosRequestConfig, type AxiosError } from 'axios'
import { persistSession, clearSession } from '@/composables/useAuth'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  const url = config.url ?? ''

  // Add token to /users/* requests – /ztm/* doesn't need auth
  if (token && url.startsWith('/users')) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

function resolveQueue(newToken: string) {
  refreshQueue.forEach((resolve) => resolve(newToken))
  refreshQueue = []
}

function shouldRefresh(url?: string) {
  if (!url) return false

  return (
    url.startsWith('/users/') &&
    !url.includes('/users/login') &&
    !url.includes('/users/add') &&
    !url.includes('/users/refresh')
  )
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config

    if (
      error.response?.status !== 401 ||
      !original ||
      !shouldRefresh(original.url)
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve)
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      })
    }

    isRefreshing = true

    try {
      console.warn('[apiService] Access token expired, refreshing...')

      const refreshToken = localStorage.getItem('refreshToken') ?? ''

      const { default: axios } = await import('axios')
      const response = await axios.get<{
        accessToken: string
        refreshToken: string
      }>(`${import.meta.env.VITE_API_BASE_URL}/users/refresh`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      })

      const tokens = response.data
      const currentUsername = sessionStorage.getItem('username') ?? ''
      persistSession(tokens, `${currentUsername}@placeholder`)

      resolveQueue(tokens.accessToken)

      original.headers.Authorization = `Bearer ${tokens.accessToken}`
      return apiClient(original)
    } catch (refreshError) {
      console.error('[apiService] Token refresh failed, clearing session')
      refreshQueue = []
      clearSession()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient(config)
  return response.data
}

export const apiService = {
  get: <T>(url: string, params?: object) =>
    request<T>({ method: 'GET', url, params }),

  post: <T>(url: string, data?: object) =>
    request<T>({ method: 'POST', url, data }),
}
