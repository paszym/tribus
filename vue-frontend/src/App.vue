<template>
  <nav class="bg-gray-800">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[9vh]">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <div class="shrink-0">
            <img class="size-8" src="./assets/logo.png" alt="Tribus" />
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
              <RouterLink
                v-hoverStyle="{ textColor: 'gray', bgColor: 'white' }"
                class="rounded-md px-3 py-2 text-sm font-medium text-white"
                to="/"
              >
                Mapa na żywo</RouterLink
              >
              <RouterLink
                v-hoverStyle="{ textColor: 'gray', bgColor: 'white' }"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300"
                to="/stops"
                >Wyszukiwarka przystanków
              </RouterLink>
              <RouterLink
                v-if="!isUserLogged"
                v-hoverStyle="{ textColor: 'gray', bgColor: 'white' }"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300"
                to="/login"
                >Zaloguj się</RouterLink
              >
              <RouterLink
                v-if="isUserLogged"
                v-hoverStyle="{ textColor: 'gray', bgColor: 'white' }"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300"
                to="/logout"
                @click.prevent="this.$logout()"
                >Wyloguj</RouterLink
              >
              <p v-if="isUserLogged" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300">
                Zalogowany użytkownik:
                <a
                  class="rounded-md mx-3 text-gray-800 my-2 px-2 py-1 font-extrabold bg-green-400 italic"
                  >{{ loggedInBanner }}</a
                >
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <RouterView />
</template>

<script lang="ts">
export default {
  // Implementacja i wykorzystanie własnej dyrektywy.
  directives: {
    hoverStyle: {
      beforeMount(el, binding) {
        const originalColor = el.style.color
        const originalBackgroundColor = el.style.backgroundColor

        el.addEventListener('mouseenter', () => {
          el.style.color = binding.value.textColor || 'white'
          el.style.backgroundColor = binding.value.bgColor || 'gray'
        })

        el.addEventListener('mouseleave', () => {
          el.style.color = originalColor
          el.style.backgroundColor = originalBackgroundColor
        })
      },
    },
  },
  data() {
    return {
      isUserLogged: false,
    }
  },
  computed: {
    loggedInBanner() {
      const username = sessionStorage.getItem('username')
      return username
    },
  },
  methods: {
    updateSessionFlag() {
      const flag = sessionStorage.getItem('loggedIn')
      this.isUserLogged = flag === 'true'
    },
  },
  async mounted() {
    this.updateSessionFlag()
    this.$router.afterEach(() => {
      this.updateSessionFlag()
    })
  },
}
</script>
