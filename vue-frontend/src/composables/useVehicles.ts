import { ref } from 'vue'
import { vehicleService } from '@/services/vehicleService'
import type { Vehicle } from '@/models/vehicle'

export function useVehicles() {
  const vehicles = ref<Vehicle[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadVehicles() {
    loading.value = true
    error.value = null
    try {
      vehicles.value = await vehicleService.getVehicles()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Nieznany błąd'
    } finally {
      loading.value = false
    }
  }

  return { vehicles, loading, error, loadVehicles }
}
