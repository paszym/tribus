export interface VehicleDto {
  generated: string
  routeShortName: string
  tripId: number
  routeId: number
  headsign: string
  vehicleCode: number
  vehicleService: string
  vehicleId: number
  speed: number
  direction: number
  delay: number
  scheduledTripStartTime: string
  lat: number
  lon: number
  gpsQuality: number
}

export interface VehiclesResponseDto {
  lastUpdate: string
  vehicles: VehicleDto[]
}
