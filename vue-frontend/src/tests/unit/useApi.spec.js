import { useApi } from './../../composables/useApi..js'

test('should fetch data correctly', async () => {
  const { data, fetchData } = useApi('/api/test')
  await fetchData()
  expect(data.value).toBeDefined()
})
