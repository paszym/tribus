import { ref } from 'vue'

function initTheme(): boolean {
  const saved = localStorage.getItem('theme')

  if (saved !== null) {
    return saved === 'dark'
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  localStorage.setItem('theme', prefersDark ? 'dark' : 'light')
  return prefersDark
}

const isDark = ref(initTheme())
document.documentElement.setAttribute(
  'data-theme',
  isDark.value ? 'dark' : 'light',
)

export function useTheme() {
  function applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme(isDark.value)
  }

  return { isDark, toggleTheme }
}
