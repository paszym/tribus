<template>
  <div class="stop-popup">
    <div class="stop-header">
      <svg
        id="D-15"
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 602 752"
      >
        <rect x="1" y="1" width="600" height="750" rx="30" ry="30" fill="#0d0f14" />
        <rect
          x=".5"
          y=".5"
          width="601"
          height="751"
          rx="30.5"
          ry="30.5"
          fill="none"
          stroke="rgba(184,134,11,0.4)"
        />
        <rect x="7" y="7" width="588" height="738" rx="24" ry="24" fill="#b8860b" opacity="0.15" />
        <rect x="81" y="81" width="440" height="440" fill="#f9e547" opacity="0.9" />
        <path
          d="M482.045,232.25H106.646l-3.771,40.991v68.319l88.815,6.832c0,15.092,12.236,27.328,27.328,27.328s27.328-12.236,27.328-27.328h136.81c0,15.092,12.236,27.328,27.328,27.328s27.328-12.236,27.328-27.328h55.979l5.336-6.832v-40.991l-17.08-68.319ZM164.362,290.321l-3.416,3.416h-44.407l-3.416-3.416,3.32-40.991,3.512-3.416h40.991l3.416,3.416v40.991ZM178.026,293.737l-6.832-3.416v-40.991l6.832-3.416h54.655l6.832,3.416v40.991l-6.832,3.416h-54.655ZM307.832,290.321l-6.832,3.416h-47.823l-6.832-3.416v-40.991l6.832-3.416h47.823l6.832,3.416v40.991ZM335.159,293.737h-13.664v-47.823h13.664v47.823ZM355.655,293.737h-13.664v-47.823h13.664v47.823ZM437.638,290.321l-6.832,3.416h-61.487l-6.832-3.416v-40.991l6.832-3.416h61.487l6.832,3.416v40.991ZM478.629,314.233h-27.328l-6.832-6.832v-58.071l6.832-3.416h27.116l13.705,54.826-13.493,13.493Z"
          fill="#0d0f14"
          fill-rule="evenodd"
        />
      </svg>
      <div class="stop-title">
        <span class="stop-name">{{ stop?.name }}</span>
        <span class="stop-code">{{ stop?.code }}</span>
      </div>
    </div>

    <div class="stop-body">
      <p class="section-label">Najbliższe odjazdy</p>

      <div v-if="!departures?.length" class="dep-empty">Brak danych o odjazdach</div>

      <div v-else class="dep-table">
        <div v-for="(dep, i) in departures?.slice(0, 8)" :key="i" class="dep-row">
          <span class="dep-time">{{ dep.estimatedTime }}</span>
          <span class="dep-badge" :class="dep.routeId < 100 ? 'tram' : 'bus'">{{
            dep.routeId
          }}</span>
          <span class="dep-headsign">{{ dep.headsign }}</span>
        </div>
      </div>
    </div>

    <div v-if="isUserLogged" class="stop-favourites">
      <label class="fav-toggle">
        <input
          type="checkbox"
          :checked="isFavouriteStop"
          @change="toggleFavouriteStop?.(stop?.id)"
        />
        <span class="fav-track" :class="{ active: isFavouriteStop }">
          <span class="fav-thumb" />
        </span>
        <span class="fav-label">Ulubiony przystanek</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    stop: Object,
    departures: Array,
    isFavouriteStop: Boolean,
    toggleFavouriteStop: Function,
  },
  data() {
    return { isUserLogged: false }
  },
  async mounted() {
    this.isUserLogged = sessionStorage.getItem('loggedIn') === 'true'
  },
}
</script>

<style scoped>
.stop-popup {
  font-family: 'DM Sans', system-ui, sans-serif;
  min-width: 230px;
  max-width: auto;
  background: rgba(13, 15, 20, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 14px;
  overflow: hidden;
}

/* Header */
.stop-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(184, 134, 11, 0.1);
  border-bottom: 1px solid rgba(184, 134, 11, 0.25);
}

.stop-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stop-name {
  font-size: 14px;
  font-weight: 600;
  color: #f9e547;
  line-height: 1.2;
}

.stop-code {
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  color: rgba(249, 229, 71, 0.4);
  letter-spacing: 0.04em;
}

/* Body */
.stop-body {
  padding: 10px 14px 8px;
}

.section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(255, 255, 255, 0.22);
  margin: 0 0 7px;
}

/* Odjazdy */
.dep-table {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 220px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.dep-row {
  display: grid;
  grid-template-columns: 52px 28px 160px;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.04);
  border: 0.5px solid rgba(255, 255, 255, 0.06);
  transition: background 0.15s;
}

.dep-row:hover {
  background: rgba(255, 255, 255, 0.07);
}

.dep-time {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.dep-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 5px;
  text-align: center;
}

.dep-badge.tram {
  background: rgba(192, 57, 43, 0.25);
  color: #e88;
}

.dep-badge.bus {
  background: rgba(26, 82, 118, 0.35);
  color: #8af;
}

.dep-headsign {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dep-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
  font-style: italic;
  padding: 8px 0;
}

/* Favourites */
.stop-favourites {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 14px 10px;
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
  background: #b8860b;
  border-color: #d4a017;
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
