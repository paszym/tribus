import type { StopDto, StopsResponseDto } from '@/types/stop.dto'
import type { Stop } from '@/models/stop'

export function mapStop(dto: StopDto): Stop {
  return {
    id: dto.stopId,
    code: dto.stopCode,
    name: dto.stopName,
    description: dto.stopDesc,
    lat: dto.stopLat,
    lon: dto.stopLon,
    type: dto.type,
    zone: dto.zoneName,
    wheelchairAccessible: dto.wheelchairBoarding === 1,
    onDemand: dto.onDemand === 1,
  }
}

export function mapStopsResponse(response: StopsResponseDto): Stop[] {
  return response.map(mapStop)
}
