<script setup lang="ts">
import AuthForm from '@/components/AuthForm.vue'
import { useAuth } from '@/composables/useAuth'

const { login } = useAuth()

async function handleLogin(payload: { email: string; password: string }) {
  await login(payload.email, payload.password)
}
</script>

<template>
  <AuthForm
    title="Zaloguj się na swoje konto"
    submit-label="Zaloguj się"
    :show-register-link="true"
    @submit="handleLogin"
  />
</template>
