import { useToast } from 'vue-toast-notification'

export default {
  install(app) {
    const toast = useToast()
    app.config.globalProperties.$logout = async function () {
      try {
        const response = await fetch('http://localhost:3000/users/logout', {
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
