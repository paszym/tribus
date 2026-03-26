<template>
  <h3 class="text-lg font-bold mb-2">Tablica odjazdów z przystanku</h3>
  <h2 class="text-lg font-bold text-white mb-2 italic bg-cyan-950 rounded-lg text-center">
    {{ currentStopName }}
  </h2>
  <div v-if="departuresData.length" class="mb-4 border p-2 rounded max-h-96 overflow-y-auto">
    <vue-good-table :columns="columns" :rows="departuresData" :search-options="{ enabled: true }" />
  </div>
  <div v-else class="mb-4 border p-2 rounded">
    <ul>
      <li><i>Brak odjazdów w najbliższym czasie</i></li>
    </ul>
  </div>
</template>

<script lang="ts">
import { VueGoodTable } from 'vue-good-table-next' // Import the component

export default {
  components: {
    VueGoodTable, // Register the component
  },
  props: {
    departuresData: {
      type: Array,
      required: true,
    },
    currentStopName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      columns: [
        { label: 'Odjazd', field: 'estimatedTime' },
        { label: 'Linia', field: 'routeId' },
        { label: 'Kierunek', field: 'headsign' },
      ],
    }
  },
}
</script>

<style>
@import 'vue-good-table-next/dist/vue-good-table-next.css';
</style>
