import { ref } from 'vue'
import { departureService } from '@/services/departureService'
import type { Departure } from '@/models/departure'

export function useDepartures() {
  const departures = ref<Departure[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadDepartures(stopId: number, reloadVisible = false) {
    const MIN_LOADING_MS = 500
    loading.value = true
    error.value = null
    departures.value = []
    const start = Date.now()
    try {
      departures.value = await departureService.getDepartures(stopId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      if (reloadVisible) {
        const elapsed = Date.now() - start
        const remaining = MIN_LOADING_MS - elapsed
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining))
        }
      }
      loading.value = false
    }
  }

  function clearDepartures() {
    departures.value = []
  }

  return { departures, loading, error, loadDepartures, clearDepartures }
}
