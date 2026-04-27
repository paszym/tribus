<template>
  <Transition name="banner-fade">
    <div v-if="visible" class="demo-banner-overlay">
      <div class="demo-banner">
        <div class="banner-icon">
          <span class="icon-ring"></span>
          <span class="icon-ring ring-2"></span>
          <span class="icon-ring ring-3"></span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            class="icon-svg"
          >
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        <div class="banner-content">
          <p class="banner-title">Oczekiwanie na dane&hellip;</p>
          <p class="banner-sub">
            Backend projektu hostowany jest bezpłatnie i po okresie nieaktywności wymaga chwili na
            uruchomienie. Prosimy o cierpliwość&nbsp;—&nbsp;dane pojawią się automatycznie.
          </p>
          <div class="banner-progress">
            <div class="progress-bar"></div>
          </div>
          <p class="banner-hint">Zwykle zajmuje to około 15–30 sekund</p>
        </div>

        <button class="banner-close" @click="visible = false" title="Zamknij">✕</button>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
const CHECK_DELAY_MS = 4000 // ile czekamy zanim sprawdzimy
const RECHECK_MS = 3000 // jak często sprawdzamy ponownie
const SELECTOR = '.leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive'

export default {
  name: 'DemoBanner',
  data() {
    return {
      visible: false,
      recheckTimer: null as ReturnType<typeof setInterval> | null,
    }
  },
  mounted() {
    // Poczekaj CHECK_DELAY_MS, potem sprawdź
    setTimeout(() => {
      if (this.noMarkers()) {
        this.visible = true
        // Co RECHECK_MS sprawdzaj czy markery już są — jeśli tak, schowaj
        this.recheckTimer = setInterval(() => {
          if (!this.noMarkers()) {
            this.visible = false
            this.stopRecheck()
          }
        }, RECHECK_MS)
      }
    }, CHECK_DELAY_MS)
  },
  beforeUnmount() {
    this.stopRecheck()
  },
  methods: {
    noMarkers() {
      return document.querySelectorAll(SELECTOR).length === 0
    },
    stopRecheck() {
      if (this.recheckTimer) {
        clearInterval(this.recheckTimer)
        this.recheckTimer = null
      }
    },
  },
}
</script>

<style scoped>
/* Overlay */
.demo-banner-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

/* Karta */
.demo-banner {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  max-width: 460px;
  width: calc(100vw - 40px);
  padding: 28px 24px 24px;
  background: rgba(13, 15, 20, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
}

/* Ikona z pulsującymi pierścieniami */
.banner-icon {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid rgba(249, 229, 71, 0.5);
  animation: ring-pulse 2.4s ease-out infinite;
}

.icon-ring.ring-2 {
  animation-delay: 0.8s;
}

.icon-ring.ring-3 {
  animation-delay: 1.6s;
}

@keyframes ring-pulse {
  0% {
    transform: scale(0.7);
    opacity: 0.7;
  }

  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}

.icon-svg {
  width: 24px;
  height: 24px;
  color: #f9e547;
  position: relative;
  z-index: 1;
  animation: clock-tick 1s steps(60) infinite;
}

@keyframes clock-tick {
  to {
    transform: rotate(360deg);
  }
}

/* Treść */
.banner-content {
  flex: 1;
  min-width: 0;
}

.banner-title {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.banner-sub {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.65;
  color: #fff;
  margin: 0 0 14px;
}

/* Progress bar — nieskończona animacja */
.banner-progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, transparent, #f9e547, transparent);
  border-radius: 2px;
  animation: progress-sweep 1.8s ease-in-out infinite;
}

@keyframes progress-sweep {
  0% {
    transform: translateX(-150%);
  }

  100% {
    transform: translateX(350%);
  }
}

.banner-hint {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 11px;
  color: #fff;
  margin: 0;
}

/* Przycisk zamknięcia */
.banner-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition:
    color 0.15s,
    background 0.15s;
  line-height: 1;
}

.banner-close:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.07);
}

/* Transition */
.banner-fade-enter-active {
  transition:
    opacity 0.35s,
    transform 0.35s;
}

.banner-fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.banner-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

.banner-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-4px);
}
</style>
