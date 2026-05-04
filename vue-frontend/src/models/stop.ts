export interface Stop {
  id: number
  code: number
  name: string
  description: string
  lat: number
  lon: number
  type: 'BUS' | 'TRAM'
  zone: string
  wheelchairAccessible: boolean
  onDemand: boolean
}
