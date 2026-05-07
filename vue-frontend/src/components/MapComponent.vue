<template>
  <div
    id="mapContainer"
    style="width: 100%; height: calc(100vh - 56px); position: relative"
  >
    <!-- Countdown -->
    <div class="map-hud update-hud">
      <span class="hud-pulse" :class="{ syncing: isSyncing }" />
      <span class="hud-text">
        {{ isSyncing ? 'Synchronizacja...' : `${updateCountdown}s` }}
      </span>
    </div>

    <!-- Przycisk ulubionych + panel -->
    <div v-if="isLoggedIn" class="favourites-anchor">
      <button
        class="fav-pill"
        :class="{ open: favOpen }"
        aria-label="Ulubione"
        @click="favOpen = !favOpen"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            :fill="favOpen ? '#e74c3c' : 'rgba(255,255,255,0.5)'"
            style="transition: fill 0.2s"
          />
        </svg>
      </button>

      <Transition name="fav-drop">
        <div v-if="favOpen" class="fav-panel">
          <p class="filters-title">Filtry ulubionych</p>

          <label class="filter-row" :class="{ on: onlyStops }">
            <span class="filter-label">Tylko przystanki</span>
            <span class="filter-toggle" :class="{ on: onlyStops }">
              <input v-model="onlyStops" type="checkbox" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
            </span>
          </label>

          <label class="filter-row" :class="{ on: onlyLines }">
            <span class="filter-label">Tylko linie</span>
            <span class="filter-toggle" :class="{ on: onlyLines }">
              <input v-model="onlyLines" type="checkbox" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
            </span>
          </label>

          <label class="filter-row" :class="{ on: onlyVehicles }">
            <span class="filter-label">Tylko pojazdy</span>
            <span class="filter-toggle" :class="{ on: onlyVehicles }">
              <input v-model="onlyVehicles" type="checkbox" />
              <span class="toggle-track"><span class="toggle-thumb" /></span>
            </span>
          </label>
        </div>
      </Transition>
    </div>

    <!-- Legenda -->
    <div class="map-hud legend-hud">
      <div class="legend-item">
        <span class="legend-dot tram" />
        <span class="legend-text">Tramwaj</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot bus" />
        <span class="legend-text">Autobus</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot stop" />
        <span class="legend-text">Przystanek</span>
      </div>
    </div>

    <DemoBanner :is-loading="vehiclesLoading" :has-error="vehiclesHasError" />
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  computed,
} from 'vue'
import { createApp, nextTick } from 'vue'
import VehiclePopup from '@/components/VehiclePopup.vue'
import DemoBanner from '@/components/DemoBanner.vue'
import { useVehicles } from '@/composables/useVehicles'
import { useStops } from '@/composables/useStops'
import { useIcons } from '@/composables/useIcons'
import type { Vehicle } from '@/models/vehicle'
import type { Stop } from '@/models/stop'
import { useFavourites } from '@/composables/useFavourites'
import { useMapRefresh } from '@/composables/useMapRefresh'
import { useAuth } from '@/composables/useAuth'
import StopBoard from './stops/StopBoard.vue'

const {
  fetchFavourites,
  isFavouriteRoute,
  isFavouriteStop,
  isFavouriteVehicle,
} = useFavourites()
const { stops, loadStops } = useStops()
const {
  vehicles,
  loadVehicles,
  loading: vehiclesLoading,
  error: vehiclesError,
} = useVehicles()

const { stopIcon, stopIconLite, getVehicleIcon, getVehicleIconLite } =
  useIcons()
const {
  countdown: updateCountdown,
  start: startRefresh,
  isSyncing,
} = useMapRefresh(updateVehiclePositions)
const { isLoggedIn } = useAuth()
const favOpen = ref(false)

const vehiclesHasError = computed(() => vehiclesError.value !== null)

const map = shallowRef<L.Map | null>(null)
const onlyStops = ref(false)
const onlyLines = ref(false)
const onlyVehicles = ref(false)

interface VehicleEntry {
  marker: L.Marker
  isLite: boolean
}
interface StopEntry {
  marker: L.Marker
  isLite: boolean
  shown: boolean
}

const vehicleEntries = new Map<number, VehicleEntry>()
const stopEntries = new Map<Stop, StopEntry>()

const vehicleLayer = L.layerGroup()
const stopLayer = L.layerGroup()

const MAX_VISIBLE_VEHICLES = 40
const MAX_VISIBLE_STOPS_FULL = 20
const MAX_VISIBLE_STOPS_SIMPLIFIED = 40
const MIN_ZOOM_STOPS = 13

watch([onlyStops, onlyLines, onlyVehicles], () => onMapMove())

// Geofence for Gdańsk area to prevent loading markers far outside the city - GPS interferences
const GEOFENCE = {
  minLat: 54.164375,
  maxLat: 54.546113,
  minLon: 18.19032,
  maxLon: 18.989575,
} as const

function isPositionValid(lat: number, lon: number): boolean {
  return (
    lat >= GEOFENCE.minLat &&
    lat <= GEOFENCE.maxLat &&
    lon >= GEOFENCE.minLon &&
    lon <= GEOFENCE.maxLon
  )
}

function getMap(): L.Map | null {
  return map.value as unknown as L.Map
}

function onMapMove() {
  const m = getMap()
  if (!m) return

  const bounds = m.getBounds()
  const zoom = m.getZoom()

  // vehicles

  let visibleVehicleCount = 0
  const vehiclesToShow: Array<{ entry: VehicleEntry; vehicle: Vehicle }> = []

  for (const [code, entry] of vehicleEntries) {
    const vehicle = vehicleMap.get(code)
    if (!vehicle) {
      entry.marker.remove()
      vehicleEntries.delete(code)
      continue
    }

    const passesFilter =
      (!onlyVehicles.value || isFavouriteVehicle(code)) &&
      (!onlyLines.value || isFavouriteRoute(vehicle.routeId))

    if (
      passesFilter &&
      bounds.contains([vehicle.lat, vehicle.lon]) &&
      isPositionValid(vehicle.lat, vehicle.lon)
    ) {
      visibleVehicleCount++
      vehiclesToShow.push({ entry, vehicle })
    } else {
      vehicleLayer.removeLayer(entry.marker)
    }
  }

  const useLiteVehicle = visibleVehicleCount > MAX_VISIBLE_VEHICLES

  for (const { entry, vehicle } of vehiclesToShow) {
    if (entry.isLite !== useLiteVehicle) {
      entry.marker.setIcon(
        useLiteVehicle ? getVehicleIconLite(vehicle) : getVehicleIcon(vehicle),
      )
      entry.isLite = useLiteVehicle
    }
    vehicleLayer.addLayer(entry.marker)
  }

  // stops

  const zoomOk = zoom > MIN_ZOOM_STOPS

  let visibleStopCount = 0
  if (zoomOk) {
    for (const [stop, _entry] of stopEntries) {
      if (
        bounds.contains([stop.lat, stop.lon]) &&
        (!onlyStops.value || isFavouriteStop(stop.id))
      ) {
        visibleStopCount++
      }
    }
  }

  const showFull = zoomOk && visibleStopCount < MAX_VISIBLE_STOPS_FULL
  const showSimplified =
    zoomOk && visibleStopCount < MAX_VISIBLE_STOPS_SIMPLIFIED

  for (const [stop, entry] of stopEntries) {
    const inBounds = bounds.contains([stop.lat, stop.lon])
    const passesFilter = !onlyStops.value || isFavouriteStop(stop.id)

    if (
      !zoomOk ||
      !inBounds ||
      !passesFilter ||
      (!showFull && !showSimplified)
    ) {
      stopLayer.removeLayer(entry.marker)
      continue
    }

    const wantLite = !showFull

    if (entry.isLite !== wantLite) {
      entry.marker.setIcon(wantLite ? stopIconLite : stopIcon)
      entry.isLite = wantLite
    }
    stopLayer.addLayer(entry.marker)
  }
}

let vehicleMap = new Map<number, Vehicle>()

function rebuildVehicleMap() {
  vehicleMap = new Map(vehicles.value.map((v) => [v.code, v]))
}

function createVehicleMarker(vehicle: Vehicle) {
  if (!vehicle.lat || !vehicle.lon) return

  const marker = L.marker([vehicle.lat, vehicle.lon], {
    icon: getVehicleIcon(vehicle),
  }).bindPopup('Ładowanie...', { minWidth: 250 })

  marker.on('popupopen', () => {
    const container = document.createElement('div')
    const app = createApp(VehiclePopup, { vehicle })
    app.mount(container)
    marker.setPopupContent(container)
    marker.openPopup()
    nextTick(() => panPopupIntoView(marker))
    marker.once('popupclose', () => app.unmount())
  })

  vehicleEntries.set(vehicle.code, { marker, isLite: false })
}

function panPopupIntoView(marker: L.Marker) {
  const m = getMap()
  if (!m) return

  const popupEl = marker.getPopup()?.getElement()
  if (!popupEl) return
  const rect = popupEl.getBoundingClientRect()
  const mapEl = m.getContainer().getBoundingClientRect()

  const popupCenterX = rect.left + rect.width / 2
  const popupCenterY = rect.top + rect.height / 2
  const mapCenterX = mapEl.left + mapEl.width / 2
  const mapCenterY = mapEl.top + mapEl.height / 2

  m.panBy([popupCenterX - mapCenterX, popupCenterY - mapCenterY])
}

function createStopMarker(stop: Stop) {
  const marker = L.marker([stop.lat, stop.lon], {
    icon: stopIcon,
  }).bindPopup('Ładowanie...')

  marker.on('popupopen', () => {
    const container = document.createElement('div')
    const app = createApp(StopBoard, {
      stop,
      onClose: () => marker.closePopup(),
      onExpanded: () => {
        nextTick(() => panPopupIntoView(marker))
      },
    })
    app.mount(container)
    marker.setPopupContent(container)
    marker.openPopup()
    nextTick(() => panPopupIntoView(marker))
    marker.once('popupclose', () => app.unmount())
  })

  stopEntries.set(stop, { marker, isLite: false, shown: false })
}

async function updateVehiclePositions() {
  try {
    await loadVehicles()
  } catch (error) {
    console.error('Error loading vehicles:', error)
    return
  }

  rebuildVehicleMap()

  for (const vehicle of vehicles.value) {
    const entry = vehicleEntries.get(vehicle.code)
    if (!entry) {
      createVehicleMarker(vehicle)
    } else {
      entry.marker.setLatLng([vehicle.lat, vehicle.lon])
    }
  }

  onMapMove()
}

function initializeMap() {
  const m = L.map('mapContainer').setView([54.352025, 18.646638], 13)

  L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(m)

  vehicleLayer.addTo(m)
  stopLayer.addTo(m)

  map.value = m
}

onMounted(async () => {
  initializeMap()

  const m = getMap()
  if (!m) return

  m.on('zoomstart', () => {
    vehicleLayer.clearLayers()
    stopLayer.clearLayers()
  })

  m.on('moveend zoomend', () => onMapMove())

  await loadVehicles()
  rebuildVehicleMap()
  vehicles.value.forEach(createVehicleMarker)

  await loadStops()
  stops.value.forEach(createStopMarker)

  onMapMove()

  startRefresh()
  await fetchFavourites()

  onMapMove()
})

onBeforeUnmount(() => {
  getMap()?.remove()
  vehicleLayer.clearLayers()
  stopLayer.clearLayers()
})
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

/* Countdown */
.update-hud {
  top: 20px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 13px;
  background: rgba(13, 15, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
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

/* Favourites anchor */
.favourites-anchor {
  position: absolute;
  top: 100px;
  right: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* Heart button */
.fav-pill {
  width: 42px;
  height: 42px;
  background: rgba(13, 15, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition:
    background 0.18s,
    border-color 0.18s;
}

.fav-pill:active {
  transform: scale(0.93);
}

/* Panel */
.fav-panel {
  background: rgba(15, 17, 23, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 190px;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
}

/* Transition */
.fav-drop-enter-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.fav-drop-leave-active {
  transition:
    opacity 0.14s ease,
    transform 0.14s ease;
}
.fav-drop-enter-from,
.fav-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* Filtry */
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

/* Legenda */
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

@media (max-width: 900px) {
  .update-hud,
  .legend-hud {
    display: none;
  }
}
</style>
