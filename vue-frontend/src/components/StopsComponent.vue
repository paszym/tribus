<template>
  <div class="stops-view">
    <div id="bg-map" class="bg-map" />

    <div class="ui-panel">
      <!-- SEARCH -->
      <div class="search-wrapper">
        <div class="search-pill">
          <svg
            class="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Wyszukaj przystanek..."
            autocomplete="off"
            spellcheck="false"
            @input="onSearch"
            @focus="showResults = true"
          />

          <span v-if="searchQuery" class="search-clear" @click="clearSearch">
            ✕
          </span>
        </div>

        <!-- WYNIKI -->
        <div
          v-if="showResults && filteredStops.length"
          class="results-dropdown"
        >
          <div
            v-for="stop in filteredStops.slice(0, 10)"
            :key="stop.id"
            class="result-row"
            :class="{ active: stop.id === currentStopId }"
            @click="selectStop(stop)"
          >
            <div class="result-left">
              <span class="result-name">{{ stop.name }}</span>
              <span class="result-code">{{ stop.code }}</span>
            </div>

            <button
              v-if="isLoggedIn"
              class="fav-btn"
              :class="{ starred: isFavouriteStop(stop.id) }"
              @click.stop="toggleFavouriteStop(stop.id)"
            >
              {{ isFavouriteStop(stop.id) ? '★' : '☆' }}
            </button>
          </div>
        </div>

        <!-- ULUBIONE -->
        <div
          v-if="isLoggedIn && !searchQuery && favouriteStops.length"
          class="results-dropdown"
        >
          <p class="dropdown-label">Ulubione przystanki</p>

          <div
            v-for="stop in favouriteStops"
            :key="stop.id"
            class="result-row"
            :class="{ active: stop.id === currentStopId }"
            @click="selectStop(stop)"
          >
            <div class="result-left">
              <span class="result-name">{{ stop.name }}</span>
              <span class="result-code">{{ stop.code }}</span>
            </div>

            <button
              class="fav-btn starred"
              @click.stop="toggleFavouriteStop(stop.id)"
            >
              ★
            </button>
          </div>
        </div>
      </div>

      <!-- PANEL ODJAZDÓW -->
      <transition name="panel-slide">
        <div v-if="currentStopName" class="departures-panel">
          <div class="panel-header">
            <span class="panel-stop-name">{{ currentStopName }}</span>
            <button class="panel-close" @click="closePanel">✕</button>
          </div>

          <div v-if="loading" class="panel-loading">Ładowanie...</div>

          <div v-else-if="!departures.length" class="panel-empty">
            Brak danych
          </div>

          <div v-else class="dep-list">
            <div
              v-for="(departure, i) in departures.slice(0, 15)"
              :key="i"
              class="dep-row"
            >
              <span class="dep-time">{{ departure.estimatedTimeString }}</span>
              <span
                class="dep-badge"
                :class="departure.routeId < 100 ? 'tram' : 'bus'"
              >
                {{ departure.routeName }}
              </span>
              <span class="dep-headsign">{{ departure.headsign }}</span>
            </div>
            <p v-if="departures.length > 15" class="dep-more">
              + {{ departures.length - 15 }} kolejnych odjazdów
            </p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useStops } from '@/composables/useStops'
import { useDepartures } from '@/composables/useDepartures'
import { useFavourites } from '@/composables/useFavourites'
import type { Stop } from '@/models/stop'

const searchQuery = ref('')
const currentStopName = ref('')
const currentStopId = ref<number | null>(null)
const showResults = ref(false)

const { isLoggedIn } = useAuth()
const { stops, loadStops, loading } = useStops()
const { departures, clearDepartures, loadDepartures } = useDepartures()
const { fetchFavourites, toggleFavouriteStop, isFavouriteStop } =
  useFavourites()

const filteredStops = computed(() => {
  if (!searchQuery.value) return []
  return stops.value.filter((stop) =>
    stop.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const favouriteStops = computed(() =>
  stops.value.filter((stop) => isFavouriteStop(stop.id)),
)

function onSearch() {
  showResults.value = true
}

function clearSearch() {
  searchQuery.value = ''
  showResults.value = false
}

function handleOutsideClick(e: MouseEvent) {
  const wrapper = document.querySelector('.search-wrapper')
  if (!wrapper?.contains(e.target as Node)) {
    showResults.value = false
  }
}

async function selectStop(stop: Stop) {
  showResults.value = false
  searchQuery.value = ''
  currentStopId.value = stop.id
  currentStopName.value = `${stop.name} ${stop.code}`
  await loadDepartures(stop.id)
}

function closePanel() {
  currentStopName.value = ''
  currentStopId.value = null
  clearDepartures()
}

onMounted(async () => {
  await loadStops()
  await fetchFavourites()
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@700&display=swap');

.stops-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Mapa tło */
.bg-map {
  position: absolute;
  inset: 0;
  background: #1a1e2a;
}

.ui-panel {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: min(520px, 90vw);
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
  overflow-y: auto;
  scrollbar-width: none;
}

.ui-panel::-webkit-scrollbar {
  display: none;
}

/* ── Search pill ── */
.search-wrapper {
  width: 100%;
}

.search-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(13, 15, 20, 0.9);
  border-radius: 40px;
}

.search-pill:focus-within {
  border-color: rgba(255, 255, 255, 0.22);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  caret-color: #1a5276;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.search-clear {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 20px;
  transition:
    color 0.15s,
    background 0.15s;
}

.search-clear:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.08);
}

/* ── Dropdown ── */
.results-dropdown {
  margin-top: 6px;
  background: rgba(13, 15, 20, 0.94);
  border-radius: 16px;
  overflow: hidden;
}

.dropdown-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(255, 255, 255, 0.25);
  padding: 10px 16px 4px;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.04);
}

.result-row:last-child {
  border-bottom: none;
}

.result-row:hover,
.result-row.active {
  background: rgba(255, 255, 255, 0.05);
}

.result-row.active .result-name {
  color: #fff;
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.result-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-code {
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  color: rgba(255, 255, 255, 0.28);
  flex-shrink: 0;
}

.fav-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.2);
  padding: 2px 4px;
  transition:
    color 0.15s,
    transform 0.15s;
  flex-shrink: 0;
}

.fav-btn:hover {
  color: #f9e547;
  transform: scale(1.2);
}

.fav-btn.starred {
  color: #f9e547;
}

/* ── Panel odjazdów ── */
.departures-panel {
  width: 100%;
  background: rgba(13, 15, 20, 0.92);
  border-radius: 16px;
  overflow: visible;
  flex-shrink: 0;
}

/* Animacja wjazdu */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.2s;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
  background: rgba(184, 134, 11, 0.08);
}

.panel-stop-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.panel-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.panel-stop-name {
  font-size: 13px;
  font-weight: 600;
  color: #f9e547;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel-stop-sub {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(249, 229, 71, 0.4);
}

.panel-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition:
    color 0.15s,
    background 0.15s;
  flex-shrink: 0;
}

.panel-close:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.07);
}

/* Loading dots */
.panel-loading {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 20px;
}

.loading-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  animation: dot-bounce 1.2s infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.4;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.panel-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* Odjazdy */
.dep-list {
  padding: 8px 0;
}

.dep-row {
  display: grid;
  grid-template-columns: 80px 30px 1fr;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

.dep-row:last-child {
  border-bottom: none;
}

.dep-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.dep-time {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  width: 160px;
}

.dep-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 5px;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
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

.dep-more {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  text-align: center;
  padding: 6px 0 8px;
  font-style: italic;
}
</style>
