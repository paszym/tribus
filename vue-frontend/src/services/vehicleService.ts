import { apiService } from '@/services/apiService'
import { mapVehicles } from '@/mappers/vehicleMapper'
import type { VehiclesResponseDto } from '@/types/vehicle.dto'
import type { Vehicle } from '@/models/vehicle'

const ENDPOINT = '/ztm/positions'

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const data = await apiService.get<VehiclesResponseDto>(ENDPOINT)
    return mapVehicles(data.vehicles)
  },
}
