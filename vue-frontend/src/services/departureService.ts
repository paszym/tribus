import { apiService } from '@/services/apiService'
import type { DeparturesResponseDto } from '@/types/departure.dto'
import { mapDepartures } from '@/mappers/departureMapper'
import type { Departure } from '@/models/departure'

const ENDPOINT = '/ztm/departures'

export const departureService = {
  getDepartures: async (stopId: number): Promise<Departure[]> => {
    const data = await apiService.get<DeparturesResponseDto>(ENDPOINT, {
      stopId,
    })
    return mapDepartures(data)
  },
}
