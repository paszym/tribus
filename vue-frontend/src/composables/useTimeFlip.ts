import { ref, onBeforeUnmount } from 'vue'

const showEstimated = ref(true)
let interval: ReturnType<typeof setInterval> | null = null
let subscribers = 0

export function useTimeFlip() {
  subscribers++
  if (!interval) {
    interval = setInterval(() => {
      showEstimated.value = !showEstimated.value
    }, 5000)
  }

  onBeforeUnmount(() => {
    subscribers--
    if (subscribers === 0 && interval) {
      clearInterval(interval)
      interval = null
    }
  })

  return { showEstimated }
}
