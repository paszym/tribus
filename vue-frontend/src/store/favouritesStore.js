import { defineStore } from 'pinia'

export const useFavouritesStore = defineStore({
  id: 'favourites',
  state: () => ({
    stops: [],
    vehicles: [],
    lines: [],
  }),
  actions: {
    addStop(id) {
      if (!this.stops.includes(id)) {
        this.stops.push(id)
      }
    },
    removeStop(id) {
      this.stops = this.stops.filter((stopId) => stopId !== id)
    },
    addVehicle(code) {
      if (!this.vehicles.includes(code)) {
        this.vehicles.push(code)
      }
    },
    removeVehicle(code) {
      this.vehicles = this.vehicles.filter((vehicleCode) => vehicleCode !== code)
    },
    addLine(id) {
      if (!this.lines.includes(id)) {
        this.lines.push(id)
      }
    },
    removeLine(id) {
      this.lines = this.lines.filter((routeId) => routeId !== id)
    },

    stopExists(id) {
      return this.stops.includes(id)
    },
    vehicleExists(code) {
      return this.vehicles.includes(code)
    },
    lineExists(id) {
      return this.lines.includes(id)
    },
    setStops(newStops) {
      this.stops = newStops
    },
    setVehicles(newVehicles) {
      this.vehicles = newVehicles
    },
    setLines(newLines) {
      this.lines = newLines
    },
    getAllAsJson() {
      return JSON.stringify({
        stops: this.stops,
        lines: this.lines,
        vehicles: this.vehicles,
      })
    },
  },
})
