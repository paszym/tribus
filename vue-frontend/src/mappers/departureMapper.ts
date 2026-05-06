import type { DepartureDto, DeparturesResponseDto } from '@/types/departure.dto'
import type { Departure } from '@/models/departure'

export function mapDeparture(dto: DepartureDto): Departure {
  const estimatedTime = new Date(dto.estimatedTime)
  const delaySeconds = dto.delayInSeconds || 0
  const minutesUntilDeparture = Math.floor(
    (estimatedTime.valueOf() - Date.now()) / (1000 * 60),
  )

  function DepartureTimeString(): string {
    const minutes = minutesUntilDeparture
    return minutes < 1 ? 'teraz' : `${minutes} min`
  }

  return {
    id: dto.id,
    routeId: dto.routeId,
    routeName: dto.routeShortName,
    headsign: dto.headsign,
    estimatedTime,
    theoreticalTime: new Date(dto.theoreticalTime),
    delaySeconds,
    status: dto.status,
    vehicleId: dto.vehicleId,
    vehicleCode: dto.vehicleCode,
    isRealtime: dto.status === 'REALTIME',
    isDelayed: delaySeconds !== null && delaySeconds > 0,
    minutesUntilDeparture,
    estimatedTimeString: DepartureTimeString(),
  }
}

export function mapDepartures(response: DeparturesResponseDto): Departure[] {
  return response.departures.map(mapDeparture)
}
