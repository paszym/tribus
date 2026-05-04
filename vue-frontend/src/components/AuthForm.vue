<template>
  <div
    class="flex min-h-full flex-col justify-center px-6 py-10 lg:px-8"
    style="background: #1a1e2a"
  >
    <img
      src="@/assets/logo.png"
      alt="Tribus Logo"
      class="mx-auto mb-6 w-20 h-20"
    />
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold text-gray-300">
        {{ title }}
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-gray-300">
            Adres email
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-black"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300">Hasło</label>
          <input
            v-model="password"
            type="password"
            required
            class="mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-black"
          />
        </div>

        <button
          type="submit"
          class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-white"
        >
          {{ submitLabel }}
        </button>
      </form>

      <p
        v-if="showRegisterLink"
        class="mt-10 text-center text-sm text-gray-500"
      >
        Nie masz jeszcze konta?
        <RouterLink
          class="ml-1 text-indigo-600 hover:text-white"
          to="/register"
        >
          Zarejestruj się
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  submitLabel: string
  showRegisterLink?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: { email: string; password: string }): void
}>()

const email = ref('')
const password = ref('')

function handleSubmit() {
  emit('submit', {
    email: email.value,
    password: password.value,
  })
}
</script>
