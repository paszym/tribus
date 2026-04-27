<template>
  <div class="stops-view">
    <div id="bg-map" class="bg-map"></div>

    <div class="search-wrapper">
      <div class="search-pill">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input v-model="searchQuery" class="search-input" placeholder="Wyszukaj przystanek..." @input="onSearch"
          @focus="showResults = true" autocomplete="off" spellcheck="false" />
        <span v-if="searchQuery" class="search-clear" @click="clearSearch">✕</span>
      </div>

      <!-- Dropdown wyników -->
      <div v-if="showResults && filteredStops.length" class="results-dropdown">
        <div v-for="stop in filteredStops.slice(0, 10)" :key="stop.id" class="result-row"
          :class="{ active: stop.id === currentStopId }" @click="selectStop(stop)">
          <div class="result-left">
            <span class="result-name">{{ stop.name }}</span>
            <span class="result-code">{{ stop.code }}</span>
          </div>
          <button v-if="isUserLogged" class="fav-btn" :class="{ starred: isFavourite(stop) }"
            @click.stop="toggleFavourite(stop.id)" title="Dodaj do ulubionych">
            {{ isFavourite(stop) ? '★' : '☆' }}
          </button>
        </div>
      </div>

      <!-- Ulubione (gdy brak wyszukiwania i zalogowany) -->
      <div v-if="isUserLogged && !searchQuery && favouriteStops.length" class="results-dropdown">
        <p class="dropdown-label">Ulubione przystanki</p>
        <div v-for="stop in favouriteStops" :key="stop.id" class="result-row"
          :class="{ active: stop.id === currentStopId }" @click="selectStop(stop)">
          <div class="result-left">
            <span class="result-name">{{ stop.name }}</span>
            <span class="result-code">{{ stop.code }}</span>
          </div>
          <button class="fav-btn starred" @click.stop="toggleFavourite(stop.id)">★</button>
        </div>
      </div>
    </div>

    <!-- Panel odjazdów -->
    <transition name="panel-slide">
      <div v-if="currentStopName" class="departures-panel">
        <!-- Nagłówek przystanku -->
        <div class="panel-header">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="panel-stop-icon">
            <rect x="10.5" y="1" width="3" height="22" rx="1" fill="#7d6000" />
            <rect x="3" y="3" width="15" height="9" rx="2" fill="#7d6000" />
            <rect x="4.5" y="4.5" width="12" height="6" rx="1.5" fill="#f9e547" />
            <rect x="6" y="6" width="5" height="3" rx="0.75" fill="#7d6000" />
          </svg>
          <div class="panel-header-text">
            <span class="panel-stop-name">{{ currentStopName }}</span>
            <span class="panel-stop-sub">Najbliższe odjazdy</span>
          </div>
          <button class="panel-close" @click="closePanel">✕</button>
        </div>

        <!-- Ładowanie -->
        <div v-if="loading" class="panel-loading">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>

        <!-- Brak danych -->
        <div v-else-if="!departuresData.length" class="panel-empty">Brak danych o odjazdach</div>

        <!-- Tabela odjazdów -->
        <div v-else class="dep-list">
          <div v-for="(dep, i) in departuresData.slice(0, 15)" :key="i" class="dep-row">
            <span class="dep-time">{{ dep.estimatedTime }}</span>
            <span class="dep-badge" :class="dep.routeId < 2000 ? 'tram' : 'bus'">
              {{ dep.routeId }}
            </span>
            <span class="dep-headsign">{{ dep.headsign }}</span>
          </div>
          <p v-if="departuresData.length > 15" class="dep-more">
            + {{ departuresData.length - 15 }} kolejnych odjazdów
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { useFavouritesStore } from './../store/favouritesStore.js'
import { useApi } from './../composables/useApi..js'
const API = import.meta.env.VITE_API_BASE_URL

export default {
  data() {
    return {
      stopsData: [],
      departuresData: [],
      searchQuery: '',
      currentStopName: '',
      currentStopId: '',
      isUserLogged: false,
      showResults: false,
      loading: false,
    }
  },
  async mounted() {
    await this.parseStopsData()
    await this.fetchFavourites()
    this.isUserLogged = sessionStorage.getItem('loggedIn') === 'true'

    // Zamknij dropdown przy kliknięciu poza
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },
  computed: {
    filteredStops() {
      if (!this.searchQuery) return []
      return this.stopsData.filter((stop) =>
        stop.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
      )
    },
    favouriteStops() {
      const favouritesStore = useFavouritesStore()
      return this.stopsData.filter((stop) => favouritesStore.stopExists(stop.id))
    },
  },
  methods: {
    onSearch() {
      this.showResults = true
    },
    clearSearch() {
      this.searchQuery = ''
      this.showResults = false
    },
    handleOutsideClick(e) {
      if (!this.$el.querySelector('.search-wrapper')?.contains(e.target)) {
        this.showResults = false
      }
    },
    async selectStop(stop) {
      this.showResults = false
      this.searchQuery = ''
      await this.fetchDepartures(stop.id)
    },
    closePanel() {
      this.currentStopName = ''
      this.currentStopId = ''
      this.departuresData = []
    },
    isFavourite(stop) {
      return useFavouritesStore().stopExists(stop.id)
    },

    async fetchDepartures(stopId) {
      try {
        const response = await this.fetchDataFromAPI(`${API}/ztm/departures?stopId=` + stopId)
        this.rawData = response
        let departures = []
        if (this.rawData?.departures) {
          departures = this.rawData.departures.map((departure) => ({
            estimatedTime: this.parseTime(departure.estimatedTime),
            routeId: departure.routeShortName,
            headsign: departure.headsign,
          }))
          console.log(departures)
          this.departuresData = departures
          const currentStop = this.stopsData.find((stop) => stop.id == stopId)
          this.currentStopName = currentStop.name + ' ' + currentStop.code
          this.currentStopId = stopId
        } else {
          this.departuresData = []
        }
      } catch (error) {
        console.log(error)
        this.departuresData = []
      }
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
          let response = await fetch(`/${API}/users/user/favourites`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          })

          if (response.ok) {
            const favouritesStore = useFavouritesStore()
            const data = await response.json()
            console.log('Favourites:', data)
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
              console.log('Favourites:', data)
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
    async fetchDataFromAPI(url: string) {
      try {
        const response = await axios.get(url)
        return response.data
      } catch (error) {
        console.error('Error fetching data:', error)
        return null
      }
    },
    async parseStopsData() {
      this.stopsRawData = await this.getStopsData()
    },
    toggleFavourite(stopId: number) {
      const favouritesStore = useFavouritesStore()
      if (favouritesStore.stopExists(stopId)) {
        favouritesStore.removeStop(stopId)
      } else {
        favouritesStore.addStop(stopId)
      }
      this.updateUserFavourites()
    },
    parseTime(isoString: string) {
      const departureDate = new Date(isoString)
      departureDate.setUTCHours(departureDate.getUTCHours())

      const currentDate = new Date()
      const diffInMs = departureDate.valueOf() - currentDate.valueOf() // różnica w milisekundach
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60)) // różnica w minutach

      if (diffInMinutes < 1) {
        return 'za <1 min'
      } else {
        return `za ${diffInMinutes} min`
      }
    },
  },
}
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

/* ── Search pill ── */
.search-wrapper {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: min(520px, 90vw);
}

.search-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(13, 15, 20, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  transition: border-color 0.2s;
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
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 2;
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
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 40%;
  background: rgba(13, 15, 20, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  width: min(520px, 90vw);
}

/* Animacja wjazdu */
.panel-slide-enter-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.panel-slide-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.panel-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

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
  grid-template-columns: 90px 30px 1fr;
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
