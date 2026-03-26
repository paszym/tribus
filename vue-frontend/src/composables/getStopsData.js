import { ref } from 'vue'
import { useApi } from './useApi..js'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export function useStopsData() {
  const stopsData = ref([])

  async function getData() {
    const stopsKey = 'stops'
    const lastUpdateKey = 'stopsLastUpdate'

    const cachedData = localStorage.getItem(stopsKey)
    const lastUpdate = localStorage.getItem(lastUpdateKey)

    if (lastUpdate && cachedData) {
      const lastUpdateDate = new Date(lastUpdate).valueOf()
      const now = new Date().valueOf()
      const hoursSinceUpdate = (now - lastUpdateDate) / (1000 * 60 * 60)

      if (hoursSinceUpdate < 24) {
        console.log('Ostatnia aktualizacja cache:', lastUpdate)
        const toast = Toast()
        let info
        if (Math.floor(hoursSinceUpdate) > 1) {
          info = `Dane przystanków z cache. Ostatnia aktualizacja: ${Math.floor(hoursSinceUpdate)} godz temu.`
        } else {
          info = `Dane przystanków z cache. Ostatnia aktualizacja: ${Math.round(60 * (hoursSinceUpdate - Math.floor(hoursSinceUpdate)))} min temu.`
        }
        toast.default(info, { duration: 3000 })

        stopsData.value = JSON.parse(cachedData)
        return stopsData.value
      }
    }

    try {
      const { data, fetchData } = useApi('http://localhost:3000/ztm/stops')
      await fetchData()

      if (data.value) {
        stopsData.value = data.value.map((stop) => ({
          lat: stop.stopLat,
          lon: stop.stopLon,
          name: stop.stopName,
          code: stop.stopCode,
          id: stop.stopId,
        }))
      } else {
        console.error('Empty json content')
      }

      localStorage.setItem(stopsKey, JSON.stringify(stopsData.value))
      localStorage.setItem(lastUpdateKey, new Date().toISOString())
      useToast().info('Pobrano dane przystanków', { duration: 3000 })
      return stopsData.value
    } catch (error) {
      console.error('Nie udało się pobrać danych:', error)
      throw error
    }
  }

  return {
    stopsData,
    getData,
  }
}
