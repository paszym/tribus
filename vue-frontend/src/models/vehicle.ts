export interface Vehicle {
  id: number
  routeId: number
  routeName: string
  headsign: string
  code: number
  service: string
  lat: number
  lon: number
  type: 'BUS' | 'TRAM'
  speed: number
  direction: number
  delaySeconds: number
  generatedAt: Date
}
