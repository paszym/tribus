<script setup lang="ts">
import AuthForm from '@/components/AuthForm.vue'
import { useAuth } from '@/composables/useAuth'

const { register } = useAuth()

async function handleRegister(payload: { email: string; password: string }) {
  await register(payload.email, payload.password)
}
</script>

<template>
  <AuthForm
    title="Zakładanie konta użytkownika"
    submit-label="Zarejestruj się"
    @submit="handleRegister"
  />
</template>
