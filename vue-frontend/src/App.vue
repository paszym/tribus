<template>
  <div style="width: 100%; height: 100vh; display: flex; flex-direction: column">
    <!-- Floating pill navbar — unosi się nad mapą -->
    <div class="nav-wrapper">
      <nav class="nav-pill">
        <div class="nav-brand">
          <img src="./assets/logo.png" alt="TriBus" class="brand-img" />
          <span class="brand-name">TriBus</span>
        </div>

        <div class="nav-divider"></div>

        <div class="nav-links">
          <RouterLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            Mapa na żywo
          </RouterLink>
          <RouterLink to="/stops" class="nav-link" :class="{ active: $route.path === '/stops' }">
            Odjazdy z przystanku
          </RouterLink>
        </div>

        <div class="nav-divider"></div>

        <div class="nav-right">
          <template v-if="isUserLogged">
            <span class="user-badge">
              <span class="user-dot"></span>
              {{ loggedInBanner }}
            </span>
            <button class="nav-btn" @click="this.$logout()">Wyloguj</button>
          </template>
          <RouterLink v-else to="/login" class="nav-btn primary">Zaloguj się</RouterLink>
        </div>
      </nav>
    </div>

    <!-- Mapa wypełnia resztę -->
    <RouterView style="flex: 1; min-height: 0" />
  </div>
</template>

<script lang="ts">
export default {
  directives: {
    hoverStyle: {
      beforeMount(el, binding) {
        const orig = el.style.color
        const origBg = el.style.backgroundColor
        el.addEventListener('mouseenter', () => {
          el.style.color = binding.value.textColor || 'white'
          el.style.backgroundColor = binding.value.bgColor || 'gray'
        })
        el.addEventListener('mouseleave', () => {
          el.style.color = orig
          el.style.backgroundColor = origBg
        })
      },
    },
  },
  data() {
    return { isUserLogged: false }
  },
  computed: {
    loggedInBanner() {
      return sessionStorage.getItem('username')
    },
  },
  methods: {
    updateSessionFlag() {
      this.isUserLogged = sessionStorage.getItem('loggedIn') === 'true'
    },
  },
  async mounted() {
    this.updateSessionFlag()
    this.$router.afterEach(() => this.updateSessionFlag())
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&family=Space+Mono:wght@700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'DM Sans', sans-serif;
}

/* Wrapper — pozycjonuje pill nad mapą */
.nav-wrapper {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  pointer-events: none;
  /* mapa klikalana pod spodem */
}

/* Pill */
.nav-pill {
  pointer-events: all;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: rgba(13, 15, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
  white-space: nowrap;
}

/* Brand */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 8px 2px 4px;
}

.brand-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.brand-name {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.03em;
}

/* Separator */
.nav-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 2px;
  flex-shrink: 0;
}

/* Linki */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
}

.nav-link {
  position: relative;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  border-radius: 30px;
  transition:
    color 0.18s,
    background 0.18s;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.06);
}

.nav-link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* Prawa strona */
.nav-right {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  padding: 4px 10px;
}

.user-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2ecc71;
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.25);
  animation: dot-pulse 2.4s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes dot-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.25);
  }

  50% {
    box-shadow: 0 0 0 5px rgba(46, 204, 113, 0);
  }
}

/* Przyciski */
.nav-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 13px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  text-decoration: none;
  transition:
    color 0.18s,
    border-color 0.18s,
    background 0.18s;
}

.nav-btn:hover {
  color: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.28);
}

.nav-btn.primary {
  background: #1a5276;
  border-color: #1a5276;
  color: #fff;
}

.nav-btn.primary:hover {
  background: #21618c;
  border-color: #21618c;
}
</style>
