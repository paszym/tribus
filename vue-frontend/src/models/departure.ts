export interface Departure {
  id: string
  routeId: number
  routeName: string
  headsign: string
  estimatedTime: Date
  theoreticalTime: Date
  delaySeconds: number
  status: 'REALTIME' | 'SCHEDULED'
  vehicleId: number | null
  vehicleCode: number | null
  isRealtime: boolean
  isDelayed: boolean
  minutesUntilDeparture: number
  estimatedTimeString: string
}
