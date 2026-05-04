import { ref, onBeforeUnmount, computed } from 'vue'

export function useMapRefresh(
  onRefresh: () => Promise<void>,
  intervalSeconds = 15,
) {
  const countdown = ref(intervalSeconds)

  let refreshInterval: ReturnType<typeof setInterval> | null = null
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  function start() {
    countdown.value = intervalSeconds

    countdownInterval = setInterval(() => {
      if (countdown.value > 0) countdown.value--
    }, 1000)

    refreshInterval = setInterval(async () => {
      await onRefresh()
      countdown.value = intervalSeconds
    }, intervalSeconds * 1000)
  }

  function stop() {
    if (refreshInterval) clearInterval(refreshInterval)
    if (countdownInterval) clearInterval(countdownInterval)
  }

  const isSyncing = computed(() => countdown.value === intervalSeconds)

  onBeforeUnmount(() => stop())

  return { countdown, isSyncing, start, stop }
}
