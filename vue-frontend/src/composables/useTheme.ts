import { ref, onMounted } from 'vue'

const isDark = ref(true)

export function useTheme() {
  function applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme(isDark.value)
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    isDark.value = saved ? saved === 'dark' : prefersDark
    applyTheme(isDark.value)
  })

  return { isDark, toggleTheme }
}
