<template>
  <div class="flex p-4 w-3/4 mx-auto max-h-full">
    <!-- Left section: Search and favourite stops -->
    <div class="w-1/2 pr-4">
      <!-- Search bar -->
      <div class="mb-4">
        <h3 class="text-lg font-bold mb-2">Wyszukiwarka przystanków:</h3>
        <input type="text" v-model="searchQuery" class="w-full p-2 border rounded" placeholder="Wyszukaj przystanek" />
      </div>

      <!-- Search results -->
      <div class="mb-4 border p-2 rounded max-h-60 overflow-y-auto">
        <table v-if="filteredStops.length" class="min-w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="py-2 px-4 text-left w-2/3">
                <i><b>Przystanek</b></i>
              </th>
              <th class="py-2 px-4 text-right w-1/3">
                <i><b></b></i>
              </th>
              <th v-if="isUserLogged" class="py-2 px-4 text-left w-1/6">
                <i><b>Ulubione</b></i>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stop in filteredStops.slice(0, 9)" :key="stop.id" class="border-b">
              <td class="py-2 px-4 text-left w-1/4">
                <span>{{ stop.name }} ({{ stop.code }})</span>
              </td>
              <td class="py-2 px-1 text-right w-1/4">
                <button v-if="stop.id !== currentStopId" @click="fetchDepartures(stop.id)"
                  class="bg-blue-500 text-white px-3 py-1 rounded">
                  Pokaż odjazdy
                </button>
                <button v-else class="text-blue-500 font-bold bg-white px-2 rounded border-x-8 border-blue-500">
                  Odjazdy >>
                </button>
              </td>
              <td v-if="isUserLogged" class="py-2 px-1 text-left w-1/4">
                <button v-if="this.isFavourite(stop)" @click="toggleFavourite(stop.id)"
                  class="bg-red-500 text-white px-3 py-1 rounded">
                  Usuń
                </button>
                <button v-else @click="toggleFavourite(stop.id)" class="bg-green-700 text-white px-3 py-1 rounded">
                  Dodaj
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else>
          <h4><i>Nie znaleziono przystanków o podanej nazwie</i></h4>
        </div>
      </div>
      <div v-if="isUserLogged">
        <h3 class="text-lg font-bold mb-2">Ulubione przystanki:</h3>
        <!-- Favourite stops -->
        <div class="mb-4 border p-2 rounded max-h-60 overflow-y-auto">
          <table v-if="favouriteStops.length" class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-200">
                <th class="py-2 px-4 text-left w-2/3">
                  <i><b>Przystanek</b></i>
                </th>
                <th class="py-2 px-4 text-right w-1/3">
                  <i><b></b></i>
                </th>
                <th class="py-2 px-4 text-left w-1/6">
                  <i><b>Ulubione</b></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stop in favouriteStops" :key="stop.id" class="border-b">
                <td class="py-2 px-4 text-left w-1/4">
                  <span>{{ stop.name }} ({{ stop.code }})</span>
                </td>
                <td class="py-2 px-1 text-right w-1/4">
                  <button v-if="stop.id !== currentStopId" @click="fetchDepartures(stop.id)"
                    class="bg-blue-500 text-white px-3 py-1 rounded">
                    Pokaż odjazdy
                  </button>
                  <button v-else class="text-blue-500 font-bold bg-white px-2 rounded border-x-8 border-blue-500">
                    Odjazdy >>
                  </button>
                </td>
                <td class="py-2 px-1 text-left w-1/4">
                  <button v-if="this.isFavourite(stop)" @click="toggleFavourite(stop.id)"
                    class="bg-red-500 text-white px-3 py-1 rounded">
                    Usuń
                  </button>
                  <button v-else @click="toggleFavourite(stop.id)" class="bg-green-700 text-white px-3 py-1 rounded">
                    Dodaj
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <a v-else>
            <i>Nie znaleziono ulubionych przystanków</i>
          </a>
        </div>
      </div>
    </div>

    <div class="w-1/2 pl-4">
      <DeparturesTable :departuresData="departuresData" :currentStopName="currentStopName" />
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import DeparturesTable from './DeparturesTable.vue'
import { useFavouritesStore } from './../store/favouritesStore.js'
import { useApi } from './../composables/useApi..js'
const API = import.meta.env.VITE_API_BASE_URL;

export default {
  components: {
    DeparturesTable,
  },
  data() {
    return {
      stopsData: [],
      departuresData: [],
      stopsRawData: [],
      searchQuery: '',
      currentStopName: '',
      currentStopId: '',
      isUserLogged: false,
    }
  },
  async mounted() {
    await this.parseStopsData()
    await this.fetchFavourites()
    const flag = sessionStorage.getItem('loggedIn')
    this.isUserLogged = flag === 'true'
  },
  computed: {
    filteredStops() {
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
    isFavourite(stop) {
      const favouritesStore = useFavouritesStore()
      return favouritesStore.stopExists(stop.id)
    },
    async fetchDepartures(stopId) {
      try {
        const response = await this.fetchDataFromAPI(
          `${API}/ztm/departures?stopId=` + stopId,
        )
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
    async fetchDataFromAPI(url) {
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
    toggleFavourite(stopId) {
      const favouritesStore = useFavouritesStore()
      if (favouritesStore.stopExists(stopId)) {
        favouritesStore.removeStop(stopId)
      } else {
        favouritesStore.addStop(stopId)
      }
      this.updateUserFavourites()
    },
    parseTime(isoString) {
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
