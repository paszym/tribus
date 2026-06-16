<template>
  <div class="stops-view">
    <div id="bg-map" class="bg-map" />
    <div
      v-if="showResults"
      class="search-overlay"
      @click="showResults = false"
    />

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

        <!-- WYNIKI WYSZUKIWANIA -->
        <div
          v-if="showResults && filteredStops.length"
          class="results-dropdown"
        >
          <div
            v-for="stop in filteredStops.slice(0, 10)"
            :key="stop.id"
            class="result-row"
            :class="{ active: stop.id === activeStop?.id }"
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
      </div>

      <!-- PANEL ODJAZDÓW – wyszukany przystanek -->
      <transition name="panel-slide">
        <StopBoard
          v-if="activeStop"
          :key="activeStop.id"
          :stop="activeStop"
          :can-close="true"
          @close="activeStop = null"
        />
      </transition>
      <div v-if="!isLoggedIn" class="fav-info">
        <span>Zaloguj się i miej ulubione przystanki zawsze pod ręką</span>
      </div>

      <!-- ULUBIONE PRZYSTANKI – panele odjazdów -->
      <template v-if="isLoggedIn && favouriteStops.length">
        <div class="favourites-section-label">Ulubione przystanki</div>
        <StopBoard
          v-for="stop in favouriteStops"
          :key="stop.id"
          :stop="stop"
          :can-close="false"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StopBoard from '@/components/stops/StopBoard.vue'
import { useAuth } from '@/composables/useAuth'
import { useStops } from '@/composables/useStops'
import { useFavourites } from '@/composables/useFavourites'
import type { Stop } from '@/models/stop'

const searchQuery = ref('')
const activeStop = ref<Stop | null>(null)
const showResults = ref(false)

const { isLoggedIn } = useAuth()
const { stops, loadStops } = useStops()
const { fetchFavourites, toggleFavouriteStop, isFavouriteStop } =
  useFavourites()

const filteredStops = computed(() => {
  if (!searchQuery.value) return []
  return stops.value.filter((stop) =>
    stop.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const favouriteStops = computed(() => {
  const favstops = stops.value.filter((stop) => isFavouriteStop(stop.id))
  return favstops.sort((a, b) => a.name.localeCompare(b.name))
})

function onSearch() {
  showResults.value = true
}

function clearSearch() {
  searchQuery.value = ''
  showResults.value = false
}

async function selectStop(stop: Stop) {
  showResults.value = false
  searchQuery.value = ''
  activeStop.value = stop
}

onMounted(async () => {
  await loadStops()
  await fetchFavourites()
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

.bg-map {
  position: absolute;
  inset: 0;
  background: var(--body-bg);
}

.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
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
  scrollbar-width: auto;
  scrollbar-color: var(--stop-color) transparent;
}

.ui-panel::-webkit-scrollbar {
  width: 4px;
}

.ui-panel::-webkit-scrollbar-track {
  background: transparent;
}

.ui-panel::-webkit-scrollbar-thumb {
  background: rgba(249, 229, 71, 0.25);
  border-radius: 99px;
}

.ui-panel::-webkit-scrollbar-thumb:hover {
  background: var(--stop-color);
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
  background: var(--nav-bg);
  border-radius: var(--border-radius);
}

.search-pill:focus-within {
  border-color: rgba(255, 255, 255, 0.22);
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--nav-text);
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
  caret-color: var(--nav-text);
}

.search-input::placeholder {
  color: var(--nav-text);
}

.search-clear {
  font-size: 11px;
  color: var(--nav-text);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 20px;
  transition:
    color 0.15s,
    background 0.15s;
}

.search-clear:hover {
  color: var(--nav-text-light);
  background: var(--nav-hover-bg);
}

/* ── Dropdown ── */
.results-dropdown {
  margin-top: 6px;
  background: var(--nav-bg);
  border-radius: var(--border-radius);
  overflow: hidden;
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
  font-size: 13px;
  font-family: 'Space Mono', monospace;
  color: rgba(255, 255, 255, 0.456);
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

/* ── Sekcja ulubionych ── */
.panel-header {
  border-bottom-color: rgba(249, 229, 71, 0.2);
  background: rgba(249, 229, 71, 0.05);
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.2s;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.favourites-section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-on-bg);
  padding: 4px 4px 0;
}

.fav-info {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-on-bg);
  padding: 4px 4px 0;
  text-align: center;
}
</style>
