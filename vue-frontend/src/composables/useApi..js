import { ref } from 'vue'
import axios from 'axios'

export function useApi(url) {
  const data = ref(null)
  const error = ref(null)

  async function fetchData() {
    try {
      const response = await axios.get(url)
      data.value = await response.data
    } catch (err) {
      error.value = err
    }
  }

  return { data, error, fetchData }
}
