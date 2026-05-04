import { favouritesStore } from '@/store/favouritesStore'
import { useAppToast } from '@/composables/useAppToast'
import { useAuth } from '@/composables/useAuth'
import { apiService } from '@/services/apiService'

interface FavouritesResponse {
  stops: number[]
  lines: number[]
  vehicles: number[]
}

export function useFavourites() {
  const store = favouritesStore()
  const toast = useAppToast()
  const { isLoggedIn } = useAuth()

  const isFavouriteStop = (id: number) => store.stopExists(id)
  const isFavouriteVehicle = (code: number) => store.vehicleExists(code)
  const isFavouriteRoute = (id: number) => store.lineExists(id)

  async function fetchFavourites() {
    if (!isLoggedIn.value) return

    try {
      const data = await apiService.get<FavouritesResponse>(
        '/users/user/favourites',
      )
      store.setStops(data.stops)
      store.setLines(data.lines)
      store.setVehicles(data.vehicles)
    } catch (error) {
      console.error('[useFavourites] fetchFavourites:', error)
      toast.error('Wystąpił błąd podczas pobierania ulubionych')
    }
  }

  async function updateUserFavourites() {
    try {
      await apiService.post('/users/user/favourites', store.getAll())
      toast.success('Zaaktualizowano pomyślnie')
    } catch (error) {
      console.error('[useFavourites] updateUserFavourites:', error)
      toast.error('Wystąpił błąd podczas aktualizacji ulubionych')
    }
  }

  async function toggleFavouriteStop(id: number) {
    if (store.stopExists(id)) {
      store.removeStop(id)
    } else {
      store.addStop(id)
    }
    await updateUserFavourites()
  }

  async function toggleFavouriteVehicle(code: number) {
    if (store.vehicleExists(code)) {
      store.removeVehicle(code)
    } else {
      store.addVehicle(code)
    }
    await updateUserFavourites()
  }

  async function toggleFavouriteRoute(id: number) {
    if (store.lineExists(id)) {
      store.removeLine(id)
    } else {
      store.addLine(id)
    }
    await updateUserFavourites()
  }

  return {
    isFavouriteStop,
    isFavouriteVehicle,
    isFavouriteRoute,
    fetchFavourites,
    toggleFavouriteStop,
    toggleFavouriteVehicle,
    toggleFavouriteRoute,
  }
}
