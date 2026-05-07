import { ref, onBeforeUnmount } from 'vue'

const showEstimated = ref(true)
const refreshTick = ref(0)

let subscribers = 0
let interval: ReturnType<typeof setInterval> | null = null
let flipCounter = 0
const FLIP_EVERY = 5 //seconds
const REFRESH_EVERY = 20 //seconds, should be a multiple of FLIP_EVERY to avoid unnecessary refreshes

export function useSynchronization() {
  subscribers++

  if (!interval) {
    interval = setInterval(() => {
      flipCounter++
      showEstimated.value = !showEstimated.value
      if (flipCounter % (REFRESH_EVERY / FLIP_EVERY) === 0) {
        refreshTick.value++
      }
    }, FLIP_EVERY * 1000)
  }

  onBeforeUnmount(() => {
    subscribers--
    if (subscribers === 0 && interval) {
      clearInterval(interval)
      interval = null
      flipCounter = 0
    }
  })

  return { showEstimated, refreshTick }
}
