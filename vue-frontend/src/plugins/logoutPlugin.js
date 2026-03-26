import { useToast } from 'vue-toast-notification'
const API = import.meta.env.VITE_API_BASE_URL

export default {
  install(app) {
    const toast = useToast()
    app.config.globalProperties.$logout = async function () {
      try {
        const response = await fetch(`${API}/users/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: localStorage.getItem('refreshToken'),
          }),
        })

        if (!response.ok) {
          console.log('Błąd podczas wylogowywania')
        }

        sessionStorage.removeItem('loggedIn')
        sessionStorage.removeItem('username')
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')

        await this.$router.push('/')
        toast.info('Pomyślnie wylogowano', { duration: 3000 })
      } catch {
        toast.error('Błąd podczas wylogowania wylogowano', { duration: 3000 })
      }
    }
  },
}
