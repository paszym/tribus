<template>
  <div id="mapContainer" class="w-full h-[91vh] relative">
    <div class="absolute top-2.5 right-2.5 bg-white/80 p-2.5 rounded font-bold text-sm z-[1000]">
      {{ updateCountdown === 5 ? 'Aktualizuję...' : `Aktualizacja za: ${updateCountdown} sekund` }}
    </div>
    <div v-if="isUserLogged"
      class="absolute top-20 right-2.5 bg-white/80 p-2.5 rounded font-bold text-sm z-[1000] space-y-2 flex flex-col">
      <p>Filtry ulubionych: <br /></p>

      <!-- Toggle 1 -->
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="onlyStops" value="" class="sr-only peer" />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
        </div>
        <span class="ms-3 text-sm font-bold text-black-900">Tylko przystanki</span>
      </label>

      <!-- Toggle 2 -->
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="onlyLines" value="" class="sr-only peer" />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
        </div>
        <span class="ms-3 text-sm font-bold text-black-900">Tylko linie</span>
      </label>

      <!-- Toggle 3 -->
      <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="onlyVehicles" value="" class="sr-only peer" />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
        </div>
        <span class="ms-3 text-sm font-bold text-black-900">Tylko pojazdy</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { createApp } from 'vue'
import StopPopup from './StopPopup.vue'
import VehiclePopup from './VehiclePopup.vue'
import { useApi } from './../composables/useApi..js'
import { useFavouritesStore } from './../store/favouritesStore.js'
const API = import.meta.env.VITE_API_BASE_URL;

const stopIcon = L.divIcon({
  className: 'berlin-marker', // Custom class name for the icon
  html: `
    <div class="bg-yellow-500 text-green-700 p-2 rounded-full w-5 h-5 border-4 border-green-700 flex items-center justify-center text-l font-bold opacity-70">
      &#x1F68D;
    </div>
  `,
  iconSize: [40, 40], // Size of the icon
  iconAnchor: [20, 20], // Anchor the icon to the center
  popupAnchor: [-7, -20],
})

/*
const busIcon = L.divIcon({
  className: 'custom-marker', // Custom class name for the icon
  html: `
  <div class="bg-blue-500 text-white p-2 rounded-full text-lg font-bold flex items-center justify-center w-7 h-7">
      B
    </div>
  `,
  iconSize: [40, 40], // Adjust size
  iconAnchor: [20, 20], // Anchor to the center
  popupAnchor: [-5, -20], // Anchor to the center
});

const tramIcon = L.divIcon({
  className: 'custom-marker', // Custom class name for the icon
  html: `
    <div class="bg-red-500 text-white p-2 rounded-full text-lg font-bold flex items-center justify-center w-7 h-7">
      T
    </div>
  `,
  iconSize: [40, 40], // Adjust size
  iconAnchor: [20, 20], // Anchor to the center
  popupAnchor: [-5, -20]
});
*/

export default {
  name: 'LeafletMap',
  data() {
    return {
      map: null,
      vehicleData: [],
      stopsData: [],
      vehicleMarkers: new Map(),
      stopMarkers: new Map(),
      departuresData: [],
      stopsRawData: [],
      rawData: null,
      updateCountdown: 5,
      markersUpdateInterval: null,
      countdownInterval: null,
      onlyStops: false, // Represents the state of the "Tylko przystanki" toggle
      onlyLines: false, // Represents the state of the "Tylko linie" toggle
      onlyVehicles: false, // Represents the state of the "Tylko pojazdy" toggle
      isUserLogged: false,
    }
  },
  watch: {
    onlyStops() {
      this.onMapMove()
    },
    onlyLines() {
      this.onMapMove()
    },
    onlyVehicles() {
      this.onMapMove()
    },
  },
  async mounted() {
    this.initializeMap()
    this.map.on('zoomstart', () => {
      this.stopMarkers.forEach((marker) => {
        marker.remove()
      })
      this.vehicleMarkers.forEach((marker) => {
        marker.remove()
      })
    })
    this.map.on('zoomend', () => {
      this.onMapMove()
    })
    await this.parseVechiclesData()
    await this.parseStopsData()
    this.initializeAllVechicleMarkers()
    this.initializeAllStopsMarkers()
    this.initializeMarkersUpdate()
    await this.fetchFavourites()
    const flag = sessionStorage.getItem('loggedIn')
    this.isUserLogged = flag == 'true' || false
    if (flag == 'true') console.log('Użytkownik zalogowany')
    else console.log('Użytkownik niezalogowany')
  },
  beforeUpdate() {
    const flag = sessionStorage.getItem('loggedIn')
    this.isUserLogged = flag == 'true' || false
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
    if (this.markersUpdateInterval) {
      clearInterval(this.markersUpdateInterval)
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  },
  methods: {
    async fetchRefresh() {
      console.warn('Access token expired. Attempting to refresh...')
      let refreshResponse
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        refreshResponse = await fetch(`${API}/users/refresh`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
        })
      } catch (error) {
        console.error('An unexpected error occurred:', error)
      }

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()

        localStorage.setItem('authToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      } else {
        console.error('Failed to refresh token.')
        const error = await refreshResponse.json()
        console.error('Refresh error:', error)
      }
    },
    async fetchFavourites() {

      const loggedIn = sessionStorage.getItem('loggedIn')
      if (loggedIn) {
        const authToken = localStorage.getItem('authToken')
        try {
          let response = await fetch(`${API}/users/user/favourites`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          })

          if (response.ok) {
            const favouritesStore = useFavouritesStore()
            const data = await response.json()
            favouritesStore.setStops(data.stops)
          } else if (response.status === 401) {
            const responseBody = await response.json()
            if (responseBody.error === 'Invalid refresh token') {
              this.$toast.warning('Token stracił ważność', { duration: 3000 })
              this.$logout()

              return
            }
            this.$toast.info('Odświeżanie tokena', { duration: 3000 })
            await this.fetchRefresh()
            const authToken = localStorage.getItem('authToken')

            response = await fetch(`${API}/users/user/favourites`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
            })

            if (response.ok) {
              const favouritesStore = useFavouritesStore()
              const data = await response.json()
              favouritesStore.setStops(data.stops)
            } else {
              this.$toast.warning('Token stracił ważność', { duration: 3000 })
              this.$logout()
            }
          } else {
            const error = await response.json()
            console.error('Error fetching favourites:', error)
            sessionStorage.setItem('loggedIn', 'false')
          }
        } catch (error) {
          console.error('An unexpected error occurred:', error)
        }
      }
    },
    generateVehicleIcon(vehicle) {
      let color = 'blue'
      if (vehicle.vehicleCode < 2000) {
        color = 'red'
      }

      const vehicleIcon = L.divIcon({
        className: 'custom-marker', // Custom class name for the icon
        html: `
        <div class="bg-${color}-500 text-white p-2 rounded-full text-lg font-bold flex items-center justify-center w-7 h-7">${vehicle.routeId}</div>
        `,
        iconSize: [40, 40], // Adjust size
        iconAnchor: [20, 20], // Anchor to the center
        popupAnchor: [-5, -20], // Anchor to the center
      })
      return vehicleIcon
    },
    isFavouriteStop(stopId) {
      const favouritesStore = useFavouritesStore()
      return favouritesStore.stopExists(stopId)
    },
    isFavouriteVehicle(vehicleCode) {
      const favouritesStore = useFavouritesStore()
      return favouritesStore.vehicleExists(vehicleCode)
    },
    isFavouriteRoute(routeId) {
      const favouritesStore = useFavouritesStore()
      return favouritesStore.lineExists(routeId)
    },
    toggleFavouriteStop(stopId) {
      const favouritesStore = useFavouritesStore()
      if (favouritesStore.stopExists(stopId)) {
        favouritesStore.removeStop(stopId)
      } else {
        favouritesStore.addStop(stopId)
      }
      this.updateUserFavourites()
      this.onMapMove()
    },
    toggleFavouriteVehicle(vehicleCode) {
      const favouritesStore = useFavouritesStore()
      if (favouritesStore.vehicleExists(vehicleCode)) {
        favouritesStore.removeVehicle(vehicleCode)
      } else {
        favouritesStore.addVehicle(vehicleCode)
      }
      this.updateUserFavourites()
      this.onMapMove()
    },
    toggleFavouriteRoute(routeId) {
      const favouritesStore = useFavouritesStore()
      if (favouritesStore.lineExists(routeId)) {
        favouritesStore.removeLine(routeId)
      } else {
        favouritesStore.addLine(routeId)
      }
      this.updateUserFavourites()
      this.onMapMove()
    },
    async updateUserFavourites() {
      const favouritesStore = useFavouritesStore()
      try {
        const authToken = localStorage.getItem('authToken')
        const response = await fetch(`${API}/users/user/favourites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: favouritesStore.getAllAsJson(),
        })

        if (response.ok) {
          this.$toast.success('Zaaktualizowano pomyślnie')
        } else {
          this.$toast.info('Odświeżanie tokena', { duration: 3000 })
          await this.fetchRefresh()
          const authToken = localStorage.getItem('authToken')
          const response = await fetch(`${API}/users/user/favourites`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: favouritesStore.getAllAsJson(),
          })

          if (response.ok) {
            this.$toast.success('Zaaktualizowano pomyślnie')
          } else {
            this.$toast.warning('Token stracił ważność', { duration: 3000 })
            this.$logout()
          }
        }
      } catch (error) {
        console.log(error.message)
      }
    },
    onMapMove() {
      const favouritesStore = useFavouritesStore()
      try {
        const bounds = this.map.getBounds()
        this.stopMarkers.forEach((marker, stop) => {
          if (this.map.getZoom() > 15 && bounds.contains([stop.lat, stop.lon])) {
            if (!this.onlyStops || favouritesStore.stopExists(stop.id)) {
              if (!marker._map) {
                marker.addTo(this.map)
              } else {
                marker.setLatLng([stop.lat, stop.lon])
              }
            } else {
              marker.remove()
            }
          } else {
            marker.remove()
          }
        })
      } catch (error) {
        console.log(error.message)
      }

      this.vehicleMarkers.forEach((marker, vehicleCode) => {
        const vehicle = this.vehicleData.find((v) => v.vehicleCode == vehicleCode)
        if (vehicle) {
          if (
            (!this.onlyVehicles || favouritesStore.vehicleExists(vehicleCode)) &&
            (!this.onlyLines || favouritesStore.lineExists(vehicle.routeId))
          ) {
            if (!marker._map) {
              marker.addTo(this.map)
            } else {
              marker.setLatLng([vehicle.lat, vehicle.lon])
            }
          } else {
            marker.remove()
          }
        }
      })
    },
    initializeMarkersUpdate() {
      this.updateCountdown = 5
      this.countdownInterval = setInterval(() => {
        if (this.updateCountdown > 0) {
          this.updateCountdown--
        }
      }, 1000)

      this.markersUpdateInterval = setInterval(async () => {
        await this.updateVehiclePositions()
        this.updateCountdown = 5
      }, 5000)
    },
    async updateVehiclePositions() {
      try {
        await this.parseVechiclesData()
      } catch (error) {
        console.error('Error parsing:', error)
      }

      this.vehicleData.forEach((vehicle) => {
        const marker = this.vehicleMarkers.get(vehicle.vehicleCode)
        if (marker == undefined) {
          this.addVehicleMarker(vehicle)
        } else {
          marker.setLatLng([vehicle.lat, vehicle.lon])
        }
      })
      this.onMapMove()
    },
    async createStopMarker(stop) {
      const marker = L.marker([stop.lat, stop.lon], { icon: stopIcon }).bindPopup('Ładowanie...')

      this.stopMarkers.set(stop, marker)

      marker.on('popupopen', async () => {
        const departuresString = await this.getStopDeparturesString(stop)
        const popupContainer = document.createElement('div')

        createApp(StopPopup, {
          stop: stop,
          departuresString: departuresString,
          isFavouriteStop: this.isFavouriteStop(stop.id),
          toggleFavouriteStop: this.toggleFavouriteStop,
        }).mount(popupContainer)

        marker.setPopupContent(popupContainer)
        marker.openPopup()
      })
    },
    async initializeAllStopsMarkers() {
      this.stopsData.forEach(async (stop) => {
        this.createStopMarker(stop)
      })
    },
    async getStopDeparturesString(stop) {
      const departures = await this.getStopDepartures(stop.id)
      if (departures != null && departures.length > 0) {
        const departuresString = departures
          .map(
            (departure) => `
          <div>
            <i class="font-bold text-gray-900">${departure.estimatedTime}</i>
            <span class="text-gray-700">-> ${departure.routeId} do ${departure.headsign}</span>
          </div>
          `,
          )
          .join('')
        return departuresString
      } else {
        return "<span class='italic text-gray-500'>Brak danych</span>"
      }
    },
    addVehicleMarker(vehicle) {
      if (!vehicle.lat || !vehicle.lon) {
        //console.error("Invalid coordinates for vehicle:", vehicle);
        return
      }
      const vehicleIcon = this.generateVehicleIcon(vehicle)
      try {
        const marker = L.marker([vehicle.lat, vehicle.lon], { icon: vehicleIcon })
          .addTo(this.map)
          .bindPopup('Ładowanie...', { minWidth: 250 })
        this.vehicleMarkers.set(vehicle.vehicleCode, marker)
        marker.on('popupopen', async () => {
          const popupContainer = document.createElement('div')

          createApp(VehiclePopup, {
            vehicle: vehicle,
            isFavouriteVehicle: this.isFavouriteVehicle(vehicle.vehicleCode),
            isFavouriteRoute: this.isFavouriteRoute(vehicle.routeId),
            toggleFavouriteVehicle: this.toggleFavouriteVehicle,
            toggleFavouriteRoute: this.toggleFavouriteRoute,
          }).mount(popupContainer)
          marker.setPopupContent(popupContainer)
          marker.openPopup()
        })
      } catch (error) {
        console.log(error.message)
      }
    },
    async initializeAllVechicleMarkers() {
      this.vehicleData.forEach((vehicle) => {
        this.addVehicleMarker(vehicle)
      })
    },
    initializeMap() {
      this.map = L.map('mapContainer').setView([54.352025, 18.646638], 13)

      L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map)
    },

    // API DATA PARSING
    parseTime(isoString) {
      const date = new Date(isoString)
      date.setUTCHours(date.getUTCHours() + 1) // UTC to PL winter
      const hours = date.getUTCHours().toString().padStart(2, '0')
      const minutes = date.getUTCMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    async getStopDepartures(stopId) {
      try {
        const { data, fetchData } = useApi(`${API}/ztm/departures?stopId=` + stopId)
        await fetchData()

        this.rawData = data
        //console.log(this.rawData);
        let departures = []
        if (this.rawData?.departures) {
          departures = this.rawData.departures.map((departure) => ({
            estimatedTime: this.parseTime(departure.estimatedTime),
            routeId: departure.routeShortName,
            headsign: departure.headsign,
          }))
          return departures
        }
      } catch { }
    },
    async getStopsData() {
      const stops = 'stops'
      const lastUpdateKey = 'stopsLastUpdate'

      const cachedData = localStorage.getItem(stops)
      const lastUpdate = localStorage.getItem(lastUpdateKey)

      if (lastUpdate && cachedData) {
        const lastUpdateDate = new Date(lastUpdate).valueOf()
        const now = new Date().valueOf()

        const hoursSinceUpdate = (now - lastUpdateDate) / (1000 * 60 * 60)

        if (hoursSinceUpdate < 24) {
          console.log('Ostatnia aktualizacja cache:', lastUpdate)
          let info
          if (Math.floor(hoursSinceUpdate) > 1) {
            info =
              'Dane przystanków z cache. Ostatnia aktualizacja: ' +
              Math.floor(hoursSinceUpdate) +
              ' godz temu.'
          } else {
            info =
              'Dane przystanków z cache. Ostatnia aktualizacja: ' +
              Math.round(60 * (hoursSinceUpdate - Math.floor(hoursSinceUpdate))) +
              ' min temu.'
          }
          this.$toast.default(info, { duration: 3000 })
          this.stopsData = JSON.parse(cachedData)
          return cachedData
        }
      }

      try {
        const { data, fetchData } = useApi(`${API}/ztm/stops`)
        await fetchData()
        this.stopsRawData = data
        try {
          if (this.stopsRawData) {
            this.stopsData = this.stopsRawData.map((stop) => ({
              lat: stop.stopLat,
              lon: stop.stopLon,
              name: stop.stopName,
              code: stop.stopCode,
              id: stop.stopId,
            }))
          } else {
            console.error('Empty json content')
          }
        } catch (error) {
          console.error('Error processing data:', error)
        }

        localStorage.setItem(stops, JSON.stringify(this.stopsData))
        localStorage.setItem(lastUpdateKey, new Date().toISOString())
        this.$toast.info('Pobrano dane przystanków', { duration: 3000 })
        return data
      } catch (error) {
        console.error('Nie udało się pobrać danych:', error)
        throw error
      }
    },
    async parseStopsData() {
      await this.getStopsData()
    },
    async parseVechiclesData() {
      const { data, fetchData } = useApi(`${API}/ztm/positions`)
      await fetchData()
      try {
        this.rawData = data
        if (this.rawData?.vehicles) {
          this.vehicleData = this.rawData.vehicles.map((vehicle) => ({
            lat: vehicle.lat,
            lon: vehicle.lon,
            routeId: vehicle.routeShortName,
            headsign: vehicle.headsign,
            vehicleCode: vehicle.vehicleCode,
            vehicleService: vehicle.vehicleService,
          }))
          //console.log(this.vehicleData);
        } else {
          console.error('Empty json content')
        }
      } catch (error) {
        console.error('Error processing data:', error)
      }
    },
  },
}
</script>
