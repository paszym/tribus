import { defineStore } from 'pinia'

export const favouritesStore = defineStore({
  id: 'favourites',
  state: () => ({
    stops: [] as number[],
    vehicles: [] as number[],
    lines: [] as number[],
  }),
  actions: {
    addStop(id: number) {
      if (!this.stops.includes(id)) {
        this.stops.push(id)
      }
    },
    removeStop(id: number) {
      this.stops = this.stops.filter((stopId) => stopId !== id)
    },
    addVehicle(code: number) {
      if (!this.vehicles.includes(code)) {
        this.vehicles.push(code)
      }
    },
    removeVehicle(code: number) {
      this.vehicles = this.vehicles.filter(
        (vehicleCode) => vehicleCode !== code,
      )
    },
    addLine(id: number) {
      if (!this.lines.includes(id)) {
        this.lines.push(id)
      }
    },
    removeLine(id: number) {
      this.lines = this.lines.filter((routeId) => routeId !== id)
    },

    stopExists(id: number) {
      return this.stops.includes(id)
    },
    vehicleExists(code: number) {
      return this.vehicles.includes(code)
    },
    lineExists(id: number) {
      return this.lines.includes(id)
    },
    setStops(newStops: number[]) {
      this.stops = newStops
    },
    setVehicles(newVehicles: number[]) {
      this.vehicles = newVehicles
    },
    setLines(newLines: number[]) {
      this.lines = newLines
    },
    getAll() {
      return {
        stops: this.stops,
        lines: this.lines,
        vehicles: this.vehicles,
      }
    },
  },
})
