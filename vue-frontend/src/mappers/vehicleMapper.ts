import type { VehicleDto } from '@/types/vehicle.dto'
import type { Vehicle } from '@/models/vehicle'

export function mapVehicle(dto: VehicleDto): Vehicle {
  return {
    id: dto.vehicleId,
    routeId: dto.routeId,
    routeName: dto.routeShortName,
    headsign: dto.headsign,
    code: dto.vehicleCode,
    service: dto.vehicleService,
    lat: dto.lat,
    lon: dto.lon,
    speed: dto.speed,
    direction: dto.direction,
    delaySeconds: dto.delay,
    generatedAt: new Date(dto.generated),
    type: dto.vehicleCode < 2000 ? 'TRAM' : 'BUS',
  }
}

export function mapVehicles(dtos: VehicleDto[]): Vehicle[] {
  return dtos.map(mapVehicle)
}
