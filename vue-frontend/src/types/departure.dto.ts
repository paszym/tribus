export type DepartureStatus = 'REALTIME' | 'SCHEDULED'

export interface DepartureDto {
  id: string
  delayInSeconds: number | null
  estimatedTime: string
  headsign: string
  routeId: number
  routeShortName: string
  scheduledTripStartTime: string
  tripId: number
  status: DepartureStatus
  theoreticalTime: string
  timestamp: string
  trip: number
  vehicleCode: number | null
  vehicleId: number | null
  vehicleService: string
}

export interface DeparturesResponseDto {
  lastUpdate: string
  departures: DepartureDto[]
}
