<template>
  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="../assets/logo.png" alt="Tribus" />
      <h2 v-if="this.$route.path === '/login'"
        class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        Zaloguj się na swoje konto
      </h2>
      <h2 v-else class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
        Zakładanie konta użytkownika
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <!-- Obsługa wysyłania formularza -->
      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label for="email" class="block text-sm/6 font-medium text-gray-900">Adres email</label>
          <div class="mt-2">
            <input type="email" name="email" id="email" autocomplete="email" v-model="email" required
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm/6 font-medium text-gray-900">Hasło</label>
          <div class="mt-2">
            <input type="password" name="password" id="password" autocomplete="current-password" v-model="password"
              required
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
          </div>
        </div>

        <div>
          <button v-if="this.$route.path === '/login'" type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Zaloguj się
          </button>
          <button v-else type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Zarejestruj się
          </button>
        </div>
      </form>

      <p v-if="this.$route.path === '/login'" class="mt-10 text-center text-sm/6 text-gray-500">
        Nie masz jeszcze konta?
        <RouterLink
          class="rounded-md px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-600 hover:text-white"
          to="/register">
          <a class="font-semibold">Zarejestruj się</a>
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
const API = import.meta.env.VITE_API_BASE_URL;
export default {
  data() {
    return {
      email: '',
      password: '',
    }
  },
  methods: {
    async submitForm() {
      if (this.$route.path === '/login') {
        await this.submitLogin()
      } else {
        await this.submitRegister()
      }
    },
    async submitLogin() {
      try {
        const response = await fetch(`${API}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        })

        if (!response.ok) {
          throw new Error('Nieprawidłowy email lub hasło')
        }

        const data = await response.json()

        localStorage.setItem('authToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        sessionStorage.setItem('loggedIn', 'true')

        const username = this.email.split('@')[0]
        sessionStorage.setItem('username', username)

        await this.$router.push('/') // Przekierowanie na stronę główną
        this.$toast.info('Zalogowano pomyślnie', { duration: 3000 })
      } catch (error) {
        console.log(error.message) // Obsługa błędów
        const info = 'Błąd podczas logowania: ' + error.message
        this.$toast.error(info, { duration: 3000 })
      }
    },
    async submitRegister() {
      try {
        const response = await fetch(`${API}/users/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        })

        if (!response.ok) {
          throw new Error('Nieprawidłowy email lub hasło')
        }

        const data = await response.json()

        localStorage.setItem('authToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        sessionStorage.setItem('loggedIn', 'true')

        const username = this.email.split('@')[0]
        sessionStorage.setItem('username', username)

        await this.$router.push('/')
        this.$toast.info('Zarejestrowano pomyślnie', { duration: 3000 })
      } catch (error) {
        console.log(error.message) // Obsługa błędów
        const info = 'Błąd podczas rejestracji: ' + error.message
        this.$toast.error(info, { duration: 3000 })
      }
    },
  },
}
</script>
