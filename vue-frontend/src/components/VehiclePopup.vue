<template>
  <div class="vehicle-popup">
    <div class="popup-header" :class="isTram ? 'tram' : 'bus'">
      <svg
        :viewBox="isTram ? '0 0 80.33 122.88' : '0 0 122.88 120.96'"
        xmlns="http://www.w3.org/2000/svg"
        class="popup-icon"
      >
        <path :d="isTram ? tramPath : busPath" fill="currentColor" fill-rule="evenodd" />
      </svg>
      <span class="popup-route">{{ vehicle?.routeId }}</span>
      <span class="popup-type">{{ isTram ? 'Tramwaj' : 'Autobus' }}</span>
    </div>

    <div class="popup-body">
      <div class="popup-row">
        <span class="popup-label">Kierunek</span>
        <span class="popup-value headsign">{{ vehicle?.headsign }}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Nr pojazdu</span>
        <span class="popup-value mono">{{ vehicle?.vehicleCode }}</span>
      </div>
      <div class="popup-row">
        <span class="popup-label">Brygada</span>
        <span class="popup-value mono">{{ vehicle?.vehicleService }}</span>
      </div>
    </div>

    <div v-if="isUserLogged" class="popup-favourites">
      <label class="fav-toggle">
        <input
          type="checkbox"
          :checked="isFavouriteVehicle"
          @change="toggleFavouriteVehicle?.(vehicle?.vehicleCode)"
        />
        <span class="fav-track" :class="{ active: isFavouriteVehicle }">
          <span class="fav-thumb" />
        </span>
        <span class="fav-label">Ulubiony pojazd</span>
      </label>
      <label class="fav-toggle">
        <input
          type="checkbox"
          :checked="isFavouriteRoute"
          @change="toggleFavouriteRoute?.(vehicle?.routeId)"
        />
        <span class="fav-track" :class="{ active: isFavouriteRoute }">
          <span class="fav-thumb" />
        </span>
        <span class="fav-label">Ulubiona linia</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
const TRAM_PATH =
  'M23.63,15h1.31L22.73,7.67l-.07-.24H18A3.72,3.72,0,0,1,18,0H62.33a3.72,3.72,0,0,1,0,7.43H57.67l-.06.24L55.39,15h.5c5.29,0,11.71,6.85,12.79,12L80.21,81.93c1.09,5.17-5.65,12.64-10.94,12.64H17.48C5,94.57-2.35,92,.69,76.93l10-49.39c1-5.2,7.7-12.52,13-12.52ZM30.4,7.43,32.69,15h15l2.29-7.59ZM8.56,122.88l8.93-20.72h11l-2.95,6.65H55.14l-3-6.84H62.93l8.84,20.53H61.12L58,115.66H22.34l-2.95,7.22Zm17.33-49A7.14,7.14,0,1,1,18.75,81a7.13,7.13,0,0,1,7.14-7.13Zm7.58-52.14H46.33a.6.6,0,0,1,.6.6v6a.6.6,0,0,1-.6.6H33.47a.6.6,0,0,1-.6-.6v-6a.6.6,0,0,1,.6-.6ZM9.35,67.23l7-31.43H63.87l6.58,31.43Zm44.56,6.65A7.14,7.14,0,1,1,46.78,81a7.13,7.13,0,0,1,7.13-7.13Z'
const BUS_PATH =
  'M105.5,104.64H99.44v9.53A6.81,6.81,0,0,1,92.65,121h-4a6.82,6.82,0,0,1-6.79-6.79v-9.53H40.82v9.53A6.82,6.82,0,0,1,34,121H30a6.81,6.81,0,0,1-6.78-6.79v-9.53H18.1c-3.54-.06-5.24-2-5.5-5.29V21.52c-2,.2-2.95.66-3.43,1.68V45.45H4.87A4.88,4.88,0,0,1,0,40.58V27.44a4.89,4.89,0,0,1,4.73-4.87c.41-3.82,2.06-4.93,8-5.21Q14,7.36,26.36,2.57C44.09-.68,77.73-1,96.52,2.57c8.28,3.19,12.8,8.12,13.62,14.79,6,.3,7.61,1.42,8,5.21a4.89,4.89,0,0,1,4.73,4.87V40.58A4.88,4.88,0,0,1,118,45.45h-4.3V23.14c-.48-1-1.47-1.44-3.43-1.63V98.59c0,4.46-1.44,6-4.78,6ZM16.13,84.87l.28-6.69c.16-1.17.78-1.69,1.89-1.5A129.9,129.9,0,0,1,34.39,86.85c1.09.72.66,2.11-.78,1.85L18.48,87.6a2.74,2.74,0,0,1-2.35-2.73ZM52,93.45H71.3a.94.94,0,0,1,.94.94v3.24a.94.94,0,0,1-.94.94H52a.94.94,0,0,1-.94-.94V94.39a.94.94,0,0,1,.94-.94Zm50.35,0A2.51,2.51,0,1,1,99.82,96a2.51,2.51,0,0,1,2.5-2.51Zm-82.65,0A2.51,2.51,0,1,1,17.16,96a2.51,2.51,0,0,1,2.51-2.51Zm87.08-8.63-.28-6.69c-.16-1.17-.78-1.69-1.88-1.5a129.28,129.28,0,0,0-16.1,10.17c-1.09.72-.66,2.11.78,1.85l15.13-1.1a2.73,2.73,0,0,0,2.35-2.73ZM48.19,6.11h26.5a1.63,1.63,0,0,1,1.62,1.62V12a1.63,1.63,0,0,1-1.62,1.62H48.19A1.63,1.63,0,0,1,46.57,12V7.73a1.63,1.63,0,0,1,1.62-1.62ZM20.32,18.91H102.2a2,2,0,0,1,2,2V64.09c0,1.08-.89,1.69-2,2-28.09,8.53-53.8,8.18-81.88,0-1.11-.3-2-.9-2-2V20.89a2,2,0,0,1,2-2Z'

export default {
  props: {
    vehicle: Object,
    isFavouriteVehicle: Boolean,
    isFavouriteRoute: Boolean,
    toggleFavouriteVehicle: Function,
    toggleFavouriteRoute: Function,
  },
  data() {
    return { isUserLogged: false, tramPath: TRAM_PATH, busPath: BUS_PATH }
  },
  computed: {
    isTram() {
      return this.vehicle?.vehicleCode < 2000
    },
  },
  async mounted() {
    this.isUserLogged = sessionStorage.getItem('loggedIn') === 'true'
  },
}
</script>

<style>
/* Leaflet popup reset — bez scoped żeby działało */
.leaflet-popup-content-wrapper {
  background: transparent !important;
  border-radius: 14px !important;
  padding: 0 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  overflow: hidden;
}

.leaflet-popup-content {
  margin: 0 !important;
  width: auto !important;
}

.leaflet-popup-tip-container {
  display: none;
}

.leaflet-popup-close-button {
  color: rgba(255, 255, 255, 0.35) !important;
  font-size: 18px !important;
  top: 8px !important;
  right: 10px !important;
  z-index: 10;
}

.leaflet-popup-close-button:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}
</style>

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
