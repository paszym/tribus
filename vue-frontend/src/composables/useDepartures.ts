import { ref } from 'vue'
import { departureService } from '@/services/departureService'
import type { Departure } from '@/models/departure'

export function useDepartures() {
  const departures = ref<Departure[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadDepartures(stopId: number) {
    loading.value = true
    error.value = null
    departures.value = []
    try {
      departures.value = await departureService.getDepartures(stopId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  function clearDepartures() {
    departures.value = []
  }

  return { departures, loading, error, loadDepartures, clearDepartures }
}
