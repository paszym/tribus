<template>
  <div class="vehicle-popup">
    <div
      class="popup-header"
      :class="vehicle?.type === 'TRAM' ? 'tram' : 'bus'"
    >
      <svg
        :viewBox="
          vehicle?.type === 'TRAM' ? '0 0 80.33 122.88' : '0 0 122.88 120.96'
        "
        xmlns="http://www.w3.org/2000/svg"
        class="popup-icon"
      >
        <path
          :d="vehicle?.type === 'TRAM' ? TRAM_PATH : BUS_PATH"
          fill="currentColor"
          fill-rule="evenodd"
        />
      </svg>
      <span class="popup-route">{{ vehicle.routeName }}</span>
      <span class="popup-type">
        {{ vehicle.type === 'TRAM' ? 'Tramwaj' : 'Autobus' }}
      </span>
    </div>

    <div class="popup-body">
      <div class="popup-row">
        <span class="popup-label">Kierunek</span>
        <span class="popup-value headsign">{{ vehicle.headsign }}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Nr pojazdu</span>
        <span class="popup-value mono">{{ vehicle.code }}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Brygada</span>
        <span class="popup-value mono">{{ vehicle.service }}</span>
      </div>
    </div>

    <div v-if="isLoggedIn" class="popup-favourites">
      <label class="fav-toggle">
        <input
          type="checkbox"
          :checked="isFavouriteVehicle(vehicle.code)"
          @change="toggleFavouriteVehicle(vehicle.code)"
        />
        <span
          class="fav-track"
          :class="{ active: isFavouriteVehicle(vehicle.code) }"
        >
          <span class="fav-thumb" />
        </span>
        <span class="fav-label">Ulubiony pojazd</span>
      </label>
      <label class="fav-toggle">
        <input
          type="checkbox"
          :checked="isFavouriteRoute(vehicle.routeId)"
          @change="toggleFavouriteRoute(vehicle.routeId)"
        />
        <span
          class="fav-track"
          :class="{ active: isFavouriteRoute(vehicle.routeId) }"
        >
          <span class="fav-thumb" />
        </span>
        <span class="fav-label">Ulubiona linia</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Vehicle } from '@/models/vehicle'
import { useIcons } from '@/composables/useIcons'
import { useFavourites } from '@/composables/useFavourites'
import { useAuth } from '@/composables/useAuth'

const { TRAM_PATH, BUS_PATH } = useIcons()
const {
  isFavouriteVehicle,
  isFavouriteRoute,
  toggleFavouriteVehicle,
  toggleFavouriteRoute,
} = useFavourites()
const { isLoggedIn } = useAuth()

defineProps<{
  vehicle: Vehicle
}>()
</script>

<style scoped>
.vehicle-popup {
  font-family: 'DM Sans', system-ui, sans-serif;
  min-width: 220px;
  background: rgba(13, 15, 20, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 14px;
  overflow: hidden;
}

/* Header */
.popup-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.popup-header.tram {
  background: rgba(192, 57, 43, 0.18);
  border-bottom: 1px solid rgba(192, 57, 43, 0.35);
  color: #e88;
}

.popup-header.bus {
  background: rgba(26, 82, 118, 0.25);
  border-bottom: 1px solid rgba(26, 82, 118, 0.5);
  color: #8af;
}

.popup-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  opacity: 0.9;
}

.popup-route {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  letter-spacing: -0.01em;
}

.popup-type {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.5;
  margin-left: auto;
  margin-right: 20px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Body */
.popup-body {
  padding: 10px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.popup-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 12px;
}

.popup-label {
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  flex-shrink: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.popup-value {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  text-align: right;
}

.popup-value.headsign {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.popup-value.mono {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

/* Favourites */
.popup-favourites {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.fav-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.fav-toggle input {
  display: none;
}

.fav-track {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition:
    background 0.2s,
    border-color 0.2s;
  flex-shrink: 0;
}

.fav-track.active {
  background: #1a5276;
  border-color: #21618c;
}

.fav-thumb {
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

.fav-track.active .fav-thumb {
  left: 16px;
  background: #fff;
}

.fav-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
