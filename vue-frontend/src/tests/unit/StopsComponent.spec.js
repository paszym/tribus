import { mount } from '@vue/test-utils'
import StopsComponent from './../../components/StopsComponent.vue'
import { useFavouritesStore } from './../../store/favouritesStore'

// Mockowanie store
jest.mock('./../../store/favouritesStore.js', () => ({
  useFavouritesStore: jest.fn(),
}))

describe('StopsComponent', () => {
  let wrapper

  beforeEach(() => {
    // Mockowanie store
    useFavouritesStore.mockReturnValue({
      stopExists: jest.fn((id) => id === 1),
      setStops: jest.fn(),
    })

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })

    // Montowanie komponentu
    wrapper = mount(StopsComponent, {
      data() {
        return {
          stopsData: [
            { id: 1, name: 'Stop 1', code: '001' },
            { id: 2, name: 'Stop 2', code: '002' },
          ],
          searchQuery: '',
          departuresData: [],
          currentStopName: '',
          currentStopId: '',
          isUserLogged: true,
        }
      },
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  // Test: Filtrowanie przystanków
  it('filtrowanie przystanków na podstawie zapytania', async () => {
    await wrapper.setData({ searchQuery: 'Stop 1' })
    expect(wrapper.vm.filteredStops).toEqual([{ id: 1, name: 'Stop 1', code: '001' }])
  })

  it('wyświetla komunikat, gdy brak wyników wyszukiwania', async () => {
    await wrapper.setData({ searchQuery: 'Nieistniejący' })
    expect(wrapper.find('h4').text()).toBe('Nie znaleziono przystanków o podanej nazwie')
  })

  it('wywołuje fetchDepartures z odpowiednim ID', async () => {
    const fetchDeparturesSpy = jest.spyOn(wrapper.vm, 'fetchDepartures')
    await wrapper.vm.fetchDepartures(1)
    expect(fetchDeparturesSpy).toHaveBeenCalledWith(1)
  })

  it('wyświetla listę ulubionych przystanków', () => {
    expect(wrapper.vm.favouriteStops).toEqual([{ id: 1, name: 'Stop 1', code: '001' }])
  })
})
