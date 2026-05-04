export interface StopDto {
  stopId: number
  stopCode: number
  stopName: string
  stopShortName: string
  stopDesc: string
  subName: string
  date: string
  zoneId: number
  zoneName: string
  wheelchairBoarding: number
  virtual: number
  nonpassenger: number
  depot: number
  ticketZoneBorder: number
  onDemand: number
  activationDate: string
  stopLat: number
  stopLon: number
  type: 'BUS' | 'TRAM'
  stopUrl: string
  locationType: string | null
  parentStation: string | null
  stopTimezone: string
}

export type StopsResponseDto = StopDto[]
