<template>
  <div id="mapContainer" style="width: 100%; height: calc(100vh - 56px); position: relative">
    <!-- Countdown -->
    <div class="map-hud update-hud">
      <span class="hud-pulse" :class="{ syncing: updateCountdown === 5 }"></span>
      <span class="hud-text">
        {{ updateCountdown === 5 ? 'Synchronizacja...' : `Odświeżenie za ${updateCountdown}s` }}
      </span>
    </div>

    <!-- Panel filtrów -->
    <div v-if="isUserLogged" class="map-hud filters-hud">
      <p class="filters-title">Filtry ulubionych</p>

      <label class="filter-row" :class="{ on: onlyStops }">
        <span class="filter-label">Tylko przystanki</span>
        <span class="filter-toggle" :class="{ on: onlyStops }">
          <input type="checkbox" v-model="onlyStops" />
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
        </span>
      </label>

      <label class="filter-row" :class="{ on: onlyLines }">
        <span class="filter-label">Tylko linie</span>
        <span class="filter-toggle" :class="{ on: onlyLines }">
          <input type="checkbox" v-model="onlyLines" />
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
        </span>
      </label>

      <label class="filter-row" :class="{ on: onlyVehicles }">
        <span class="filter-label">Tylko pojazdy</span>
        <span class="filter-toggle" :class="{ on: onlyVehicles }">
          <input type="checkbox" v-model="onlyVehicles" />
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
        </span>
      </label>
    </div>

    <!-- Legenda -->
    <div class="map-hud legend-hud">
      <div class="legend-item">
        <span class="legend-dot tram"></span>
        <span class="legend-text">Tramwaj</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot bus"></span>
        <span class="legend-text">Autobus</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot stop"></span>
        <span class="legend-text">Przystanek</span>
      </div>
    </div>
    <DemoBanner />
  </div>
</template>

<script lang="ts">
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { createApp } from 'vue'
import StopPopup from './StopPopup.vue'
import VehiclePopup from './VehiclePopup.vue'
import DemoBanner from './DemoBanner.vue'
import { useApi } from './../composables/useApi..js'
import { useFavouritesStore } from './../store/favouritesStore.js'
const API = import.meta.env.VITE_API_BASE_URL

const stopIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 26px;
      height: 28px;
      background: #b9c5df;
      border: 2px solid #0b204a;
      border-radius: 20%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      opacity: 0.83;
    ">
      <?xml version="1.0" encoding="UTF-8"?>
<svg id="D-15" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 602 752">
  <rect x="1" y="1" width="600" height="750" rx="30" ry="30" fill="#fff"/>
  <rect x=".5" y=".5" width="601" height="751" rx="30.5" ry="30.5" fill="none" stroke="#000"/>
  <rect x="7" y="7" width="588" height="738" rx="24" ry="24" fill="#039"/>
  <rect x="81" y="81" width="440" height="440" fill="#fff"/>
  <path d="M482.045,232.25H106.646l-3.771,40.991v68.319l88.815,6.832c0,15.092,12.236,27.328,27.328,27.328s27.328-12.236,27.328-27.328h136.81c0,15.092,12.236,27.328,27.328,27.328s27.328-12.236,27.328-27.328h55.979l5.336-6.832v-40.991l-17.08-68.319ZM164.362,290.321l-3.416,3.416h-44.407l-3.416-3.416,3.32-40.991,3.512-3.416h40.991l3.416,3.416v40.991ZM178.026,293.737l-6.832-3.416v-40.991l6.832-3.416h54.655l6.832,3.416v40.991l-6.832,3.416h-54.655ZM307.832,290.321l-6.832,3.416h-47.823l-6.832-3.416v-40.991l6.832-3.416h47.823l6.832,3.416v40.991ZM335.159,293.737h-13.664v-47.823h13.664v47.823ZM355.655,293.737h-13.664v-47.823h13.664v47.823ZM437.638,290.321l-6.832,3.416h-61.487l-6.832-3.416v-40.991l6.832-3.416h61.487l6.832,3.416v40.991ZM478.629,314.233h-27.328l-6.832-6.832v-58.071l6.832-3.416h27.116l13.705,54.826-13.493,13.493Z" fill-rule="evenodd"/>
</svg>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -10],
})

const stopLiteIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #b8860b;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
  popupAnchor: [0, -6],
})

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
  components: { DemoBanner },
  async mounted() {
    this.initializeMap()
    if (this.map) {
      this.map.on('zoomstart', () => {
        this.stopMarkers.forEach((marker) => {
          marker.remove()
        })
        this.vehicleMarkers.forEach((marker) => {
          marker.remove()
        })
      })
      this.map.on('moveend zoomend', () => {
        this.onMapMove()
      })
    }

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
    this.onMapMove()
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

      if (refreshResponse?.ok) {
        const data = await refreshResponse.json()

        localStorage.setItem('authToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
      } else {
        console.error('Failed to refresh token.')
        const error = await refreshResponse?.json()
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
      const isTram = vehicle.vehicleCode < 2000

      const colors = isTram
        ? { bg: '#fadbd8', border: '#c0392b', text: '#922b21', icon: '#c0392b' }
        : { bg: '#d6eaf8', border: '#1a5276', text: '#1a5276', icon: '#1a5276' }

      const tramPath = `M23.63,15h1.31L22.73,7.67l-.07-.24H18A3.72,3.72,0,0,1,18,0H62.33a3.72,3.72,0,0,1,0,7.43H57.67l-.06.24L55.39,15h.5c5.29,0,11.71,6.85,12.79,12L80.21,81.93c1.09,5.17-5.65,12.64-10.94,12.64H17.48C5,94.57-2.35,92,.69,76.93l10-49.39c1-5.2,7.7-12.52,13-12.52ZM30.4,7.43,32.69,15h15l2.29-7.59ZM8.56,122.88l8.93-20.72h11l-2.95,6.65H55.14l-3-6.84H62.93l8.84,20.53H61.12L58,115.66H22.34l-2.95,7.22Zm17.33-49A7.14,7.14,0,1,1,18.75,81a7.13,7.13,0,0,1,7.14-7.13Zm7.58-52.14H46.33a.6.6,0,0,1,.6.6v6a.6.6,0,0,1-.6.6H33.47a.6.6,0,0,1-.6-.6v-6a.6.6,0,0,1,.6-.6ZM9.35,67.23l7-31.43H63.87l6.58,31.43Zm44.56,6.65A7.14,7.14,0,1,1,46.78,81a7.13,7.13,0,0,1,7.13-7.13Z`

      const busPath = `M105.5,104.64H99.44v9.53A6.81,6.81,0,0,1,92.65,121h-4a6.82,6.82,0,0,1-6.79-6.79v-9.53H40.82v9.53A6.82,6.82,0,0,1,34,121H30a6.81,6.81,0,0,1-6.78-6.79v-9.53H18.1c-3.54-.06-5.24-2-5.5-5.29V21.52c-2,.2-2.95.66-3.43,1.68V45.45H4.87A4.88,4.88,0,0,1,0,40.58V27.44a4.89,4.89,0,0,1,4.73-4.87c.41-3.82,2.06-4.93,8-5.21Q14,7.36,26.36,2.57C44.09-.68,77.73-1,96.52,2.57c8.28,3.19,12.8,8.12,13.62,14.79,6,.3,7.61,1.42,8,5.21a4.89,4.89,0,0,1,4.73,4.87V40.58A4.88,4.88,0,0,1,118,45.45h-4.3V23.14c-.48-1-1.47-1.44-3.43-1.63V98.59c0,4.46-1.44,6-4.78,6ZM16.13,84.87l.28-6.69c.16-1.17.78-1.69,1.89-1.5A129.9,129.9,0,0,1,34.39,86.85c1.09.72.66,2.11-.78,1.85L18.48,87.6a2.74,2.74,0,0,1-2.35-2.73ZM52,93.45H71.3a.94.94,0,0,1,.94.94v3.24a.94.94,0,0,1-.94.94H52a.94.94,0,0,1-.94-.94V94.39a.94.94,0,0,1,.94-.94Zm50.35,0A2.51,2.51,0,1,1,99.82,96a2.51,2.51,0,0,1,2.5-2.51Zm-82.65,0A2.51,2.51,0,1,1,17.16,96a2.51,2.51,0,0,1,2.51-2.51Zm87.08-8.63-.28-6.69c-.16-1.17-.78-1.69-1.88-1.5a129.28,129.28,0,0,0-16.1,10.17c-1.09.72-.66,2.11.78,1.85l15.13-1.1a2.73,2.73,0,0,0,2.35-2.73ZM48.19,6.11h26.5a1.63,1.63,0,0,1,1.62,1.62V12a1.63,1.63,0,0,1-1.62,1.62H48.19A1.63,1.63,0,0,1,46.57,12V7.73a1.63,1.63,0,0,1,1.62-1.62ZM20.32,18.91H102.2a2,2,0,0,1,2,2V64.09c0,1.08-.89,1.69-2,2-28.09,8.53-53.8,8.18-81.88,0-1.11-.3-2-.9-2-2V20.89a2,2,0,0,1,2-2Z`

      const iconSvg = `
        <svg
          viewBox="${isTram ? '0 0 80.33 122.88' : '0 0 122.88 120.96'}"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 14px; height: 14px; flex-shrink: 0; display: block;"
        >
          <path d="${isTram ? tramPath : busPath}" fill="${colors.icon}" fill-rule="evenodd"/>
        </svg>
      `

      const routeLabel = `
        <span style="
          font-size: 11px;
          font-weight: 700;
          color: ${colors.text};
          line-height: 1;
          white-space: nowrap;
        ">${vehicle.routeId}</span>
      `

      const html = `
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 6px 3px 5px;
          background: ${colors.bg};
          border: 1.5px solid ${colors.border};
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
          white-space: nowrap;
        ">
          ${iconSvg}
          ${routeLabel}
        </div>
      `

      const width = 16 + vehicle.routeId.toString().length * 7 + 10
      return L.divIcon({
        className: '',
        html,
        iconSize: [width, 22],
        iconAnchor: [width / 2 + 2, 11],
      })
    },
    isFavouriteStop(stopId: number) {
      const favouritesStore = useFavouritesStore()
      return favouritesStore.stopExists(stopId)
    },
    isFavouriteVehicle(vehicleCode: string) {
      const favouritesStore = useFavouritesStore()
      return favouritesStore.vehicleExists(vehicleCode)
    },
    isFavouriteRoute(routeId: string) {
      const favouritesStore = useFavouritesStore()
      return favouritesStore.lineExists(routeId)
    },
    toggleFavouriteStop(stopId: number) {
      const favouritesStore = useFavouritesStore()
      if (favouritesStore.stopExists(stopId)) {
        favouritesStore.removeStop(stopId)
      } else {
        favouritesStore.addStop(stopId)
      }
      this.updateUserFavourites()
      this.onMapMove()
    },
    toggleFavouriteVehicle(vehicleCode: string) {
      const favouritesStore = useFavouritesStore()
      if (favouritesStore.vehicleExists(vehicleCode)) {
        favouritesStore.removeVehicle(vehicleCode)
      } else {
        favouritesStore.addVehicle(vehicleCode)
      }
      this.updateUserFavourites()
      this.onMapMove()
    },
    toggleFavouriteRoute(routeId: string) {
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
      const MAX_VISIBLE_STOPS = 20
      const MAX_VISIBLE_STOPS_SIMPLIFIED = 50
      const MAX_VISIBLE_VEHICLES = 25
      const MAX_ZOOM_FOR_STOPS = 10
      const MAX_ZOOM_FOR_STOPS_SIMPLIFIED = 12

      const favouritesStore = useFavouritesStore()
      const bounds = this.map.getBounds()
      const zoom = this.map.getZoom()

      // Vehicle visibility logic
      let visibleCount = 0
      this.vehicleMarkers.forEach((marker, vehicleCode) => {
        const vehicle = this.vehicleData.find((v) => v.vehicleCode == vehicleCode)
        if (!vehicle) return
        const shouldShow =
          (!this.onlyVehicles || favouritesStore.vehicleExists(vehicleCode)) &&
          (!this.onlyLines || favouritesStore.lineExists(vehicle.routeId))
        if (shouldShow && bounds.contains([vehicle.lat, vehicle.lon])) {
          visibleCount++
        }
      })

      const useLite = visibleCount > MAX_VISIBLE_VEHICLES

      this.vehicleMarkers.forEach((marker, vehicleCode) => {
        const vehicle = this.vehicleData.find((v) => v.vehicleCode == vehicleCode)
        if (!vehicle) return

        const shouldShow =
          (!this.onlyVehicles || favouritesStore.vehicleExists(vehicleCode)) &&
          (!this.onlyLines || favouritesStore.lineExists(vehicle.routeId))

        if (shouldShow) {
          const currentlyLite = marker.options.isLite ?? null
          if (currentlyLite !== useLite) {
            marker.setIcon(
              useLite ? this.generateLiteIcon(vehicle) : this.generateVehicleIcon(vehicle),
            )
            marker.options.isLite = useLite
          }

          if (!marker._map) {
            marker.addTo(this.map)
          } else {
            marker.setLatLng([vehicle.lat, vehicle.lon])
          }
        } else {
          marker.remove()
        }
      })

      // Stop visibility logic
      const zoomOk = zoom > MAX_ZOOM_FOR_STOPS

      let visibleStopCount = 0
      if (zoomOk) {
        this.stopMarkers.forEach((marker, stop) => {
          if (bounds.contains([stop.lat, stop.lon])) {
            if (!this.onlyStops || favouritesStore.stopExists(stop.id)) {
              visibleStopCount++
            }
          }
        })
      }

      const showFull = zoomOk && visibleStopCount < MAX_VISIBLE_STOPS
      const showSimplified = zoom > MAX_ZOOM_FOR_STOPS_SIMPLIFIED && visibleStopCount < MAX_VISIBLE_STOPS_SIMPLIFIED

      this.stopMarkers.forEach((marker, stop) => {
        const inBounds = bounds.contains([stop.lat, stop.lon])
        const passesFilter = !this.onlyStops || favouritesStore.stopExists(stop.id)

        if (!inBounds || !passesFilter) {
          marker.remove()
          return
        }

        if (showFull) {
          if (marker.options.isLite) {
            marker.setIcon(stopIcon)
            marker.options.isLite = false
          }
          if (!marker._map) marker.addTo(this.map)
          else marker.setLatLng([stop.lat, stop.lon])
        } else if (showSimplified) {
          if (!marker.options.isLite) {
            marker.setIcon(stopLiteIcon)
            marker.options.isLite = true
          }
          if (!marker._map) marker.addTo(this.map)
          else marker.setLatLng([stop.lat, stop.lon])
        } else {
          marker.remove()
        }
      })


    },
    generateLiteIcon(vehicle) {
      const isTram = vehicle.vehicleCode < 2000
      return L.divIcon({
        className: '',
        html: `<div style="
      width:14px;height:14px;
      border-radius:50%;
      background:${isTram ? '#cd6155' : '#497896'};
      border:0.1px solid white;
      box-shadow:0 1px 3px rgba(0,0,0,0.35);
    "></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
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
        const departures = await this.getStopDepartures(stop.id)
        const popupContainer = document.createElement('div')

        createApp(StopPopup, {
          stop: stop,
          departures: departures?.slice(0, 8),
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
      //date.setUTCHours(date.getUTCHours() + 1) // UTC to PL winter
      date.setUTCHours(date.getUTCHours() + 2) // UTC to PL summer
      const hours = date.getUTCHours().toString().padStart(2, '0')
      const minutes = date.getUTCMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    async getStopDepartures(stopId: number) {
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

      if (lastUpdate && cachedData && cachedData.length > 0) {
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

<style scoped>
.map-hud {
  position: absolute;
  z-index: 1000;
  background: rgba(15, 17, 23, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
}

/* Countdown (góra prawa) */
.update-hud {
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 13px;
}

.hud-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #27ae60;
  flex-shrink: 0;
  transition: background 0.3s;
}

.hud-pulse.syncing {
  background: #f39c12;
  animation: blink 0.6s infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.2;
  }
}

.hud-text {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  font-family: 'Space Mono', monospace;
  letter-spacing: 0.02em;
}

/* Filtry (góra prawa, pod countdown) */
.filters-hud {
  top: 56px;
  right: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 190px;
}

.filters-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 4px;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 5px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.filter-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.filter-label {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  transition: color 0.2s;
}

.filter-row.on .filter-label {
  color: rgba(255, 255, 255, 0.9);
}

/* Toggle */
.filter-toggle input {
  display: none;
}

.toggle-track {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition:
    background 0.2s,
    border-color 0.2s;
  display: block;
}

.filter-toggle.on .toggle-track {
  background: #1a5276;
  border-color: #21618c;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition:
    left 0.2s,
    background 0.2s;
}

.filter-toggle.on .toggle-thumb {
  left: 16px;
  background: white;
}

/* Legenda (dół lewa) */
.legend-hud {
  bottom: 28px;
  left: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 13px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid white;
}

.legend-dot.tram {
  background: #c0392b;
}

.legend-dot.bus {
  background: #1a5276;
}

.legend-dot.stop {
  background: #b8860b;
}

.legend-text {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
}
</style>
