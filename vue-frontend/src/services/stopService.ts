import { apiService } from '@/services/apiService'
import { mapStopsResponse } from '@/mappers/stopMapper'
import type { StopsResponseDto } from '@/types/stop.dto'
import type { Stop } from '@/models/stop'

const ENDPOINT = '/ztm/stops'
const CACHE_KEY = 'stops'
const LAST_UPDATE_KEY = 'stopsLastUpdate'

export interface FetchStopsResult {
  data: Stop[]
  fromCache: boolean
  hoursSince: number | null
}

export const stopService = {
  async getStops(): Promise<FetchStopsResult> {
    const cached = getCachedStops()
    if (cached) {
      return {
        data: cached.stops,
        fromCache: true,
        hoursSince: cached.hoursSince,
      }
    }

    const raw = await apiService.get<StopsResponseDto>(ENDPOINT)
    const stops = mapStopsResponse(raw)

    if (!stops.length) throw new Error('Puste dane przystanków')

    localStorage.setItem(CACHE_KEY, JSON.stringify(stops))
    localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString())

    return { data: stops, fromCache: false, hoursSince: null }
  },
}

function getCachedStops(): { stops: Stop[]; hoursSince: number } | null {
  const cached = localStorage.getItem(CACHE_KEY)
  const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY)

  if (!cached || !lastUpdate || cached === 'null' || cached === '') return null

  const hoursSince =
    (Date.now() - new Date(lastUpdate).valueOf()) / (1000 * 60 * 60)

  if (hoursSince >= 24) return null

  return { stops: JSON.parse(cached) as Stop[], hoursSince }
}
