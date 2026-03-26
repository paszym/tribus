<template>
  <div>
    <p class="text-sm text-gray-700">
      <strong>Nr linii: </strong>{{ vehicle?.routeId }}<br />
      <strong>Kierunek: </strong>{{ vehicle?.headsign }}<br />
      <strong>Nr pojazdu: </strong>{{ vehicle?.vehicleCode }}<br />
      <strong>Brygada: </strong>{{ vehicle?.vehicleService }}<br />
    </p>
    <label v-if="isUserLogged" class="inline-flex items-center cursor-pointer mt-3">
      <input
        type="checkbox"
        :checked="isFavouriteVehicle"
        @change="toggleFavouriteVehicle(vehicle?.vehicleCode)"
        class="sr-only peer"
      />
      <div
        class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
      ></div>
      <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ulubiony pojazd</span>
    </label>
    <label v-if="isUserLogged" class="inline-flex items-center cursor-pointer mt-3">
      <input
        type="checkbox"
        :checked="isFavouriteRoute"
        @change="toggleFavouriteRoute(vehicle?.routeId)"
        class="sr-only peer"
      />
      <div
        class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
      ></div>
      <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ulubiona linia</span>
    </label>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    vehicle: Object,
    isFavouriteVehicle: Boolean,
    isFavouriteRoute: Boolean,
    toggleFavouriteVehicle: Function,
    toggleFavouriteRoute: Function,
  },
  data() {
    return {
      isUserLogged: false,
    }
  },
  async mounted() {
    const flag = sessionStorage.getItem('loggedIn')
    this.isUserLogged = flag === 'true'
  },
}
</script>
