import { ref } from 'vue'
import { stopService } from '@/services/stopService'
import { useAppToast } from '@/composables/useAppToast'
import type { Stop } from '@/models/stop'

export function useStops() {
  const stops = ref<Stop[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const toast = useAppToast()

  async function loadStops() {
    loading.value = true
    error.value = null
    try {
      const { data, fromCache, hoursSince } = await stopService.getStops()
      stops.value = data

      if (fromCache && hoursSince !== null) {
        const info =
          hoursSince >= 1
            ? `Dane przystanków z cache. Ostatnia aktualizacja: ${Math.floor(hoursSince)} godz temu.`
            : `Dane przystanków z cache. Ostatnia aktualizacja: ${Math.round(60 * (hoursSince % 1))} min temu.`
        toast.info(info)
      } else {
        toast.info('Pobrano dane przystanków')
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  return { stops, loading, error, loadStops }
}
