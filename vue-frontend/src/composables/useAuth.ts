import { ref, readonly } from 'vue'
import { useAppToast } from '@/composables/useAppToast'
import { authService } from '@/services/authService'
import type { AuthTokens } from '@/services/authService'
import router from '@/router'

const isLoggedIn = ref(sessionStorage.getItem('loggedIn') === 'true')
const username = ref(sessionStorage.getItem('username') ?? '')

export function persistSession(tokens: AuthTokens, email: string) {
  localStorage.setItem('authToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
  sessionStorage.setItem('loggedIn', 'true')

  const name = email.split('@')[0] ?? ''
  sessionStorage.setItem('username', name)

  isLoggedIn.value = true
  username.value = name
}

export function clearSession() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  sessionStorage.removeItem('loggedIn')
  sessionStorage.removeItem('username')

  isLoggedIn.value = false
  username.value = ''
}

export function useAuth() {
  const toast = useAppToast()

  function handleError(error: unknown, context: string) {
    const message = error instanceof Error ? error.message : 'Nieznany błąd'
    toast.error(`Błąd podczas ${context}: ${message}`)
  }

  async function login(email: string, password: string) {
    try {
      const tokens = await authService.login({ email, password })
      if (tokens) persistSession(tokens, email)
      await router.push('/')
      toast.info('Zalogowano pomyślnie')
    } catch (error: unknown) {
      handleError(error, 'logowania')
    }
  }

  async function register(email: string, password: string) {
    try {
      const tokens = await authService.register({ email, password })
      persistSession(tokens, email)
      await router.push('/')
      toast.info('Zarejestrowano pomyślnie')
    } catch (error: unknown) {
      handleError(error, 'rejestracji')
    }
  }

  async function logout() {
    try {
      await authService.logout(localStorage.getItem('refreshToken') ?? '')
    } catch (error: unknown) {
      handleError(error, 'wylogowania')
    } finally {
      clearSession()
      await router.push('/')
      toast.info('Pomyślnie wylogowano')
    }
  }

  return {
    isLoggedIn: readonly(isLoggedIn),
    username: readonly(username),
    login,
    register,
    logout,
  }
}
