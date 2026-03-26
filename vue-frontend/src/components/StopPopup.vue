<template>
  <div>
    <p>
      <strong class="text-gray-900">Nazwa przystanku:</strong> {{ stop?.name }} {{ stop?.code }}
    </p>
    <p>
      <strong class="text-gray-900">Najbliższe odjazdy:</strong><br />
      <span v-html="departuresString"></span>
    </p>
    <label v-if="isUserLogged" class="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        :checked="isFavouriteStop"
        @change="toggleFavouriteStop(stop?.id)"
        class="sr-only peer"
      />
      <div
        class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
      ></div>
      <span class="ms-3 text-sm font-bold text-black-900">Ulubiony przystanek</span>
    </label>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    stop: Object,
    departuresString: String,
    isFavouriteStop: Boolean,
    toggleFavouriteStop: Function,
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
