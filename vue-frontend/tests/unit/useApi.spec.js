import { describe, expect, test } from 'vitest'
import { useApi } from '@/composables/useApi'

describe('useApi', () => {
  test('should fetch data correctly', async () => {
    const { data, fetchData } = useApi('/api/test')
    await fetchData()
    expect(data.value).toBeDefined()
  })
})
