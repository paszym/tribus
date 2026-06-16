<template>
  <div class="departures-panel">
    <div class="panel-header">
      <span
        class="panel-stop-name"
        title="Odśwież"
        @click="loadDepartures(stop.id, true)"
      >
        {{ stop.name }}
        <span class="panel-stop-subname">{{ stop.code }}</span>
      </span>
      <div class="panel-header-actions">
        <button
          v-if="isLoggedIn"
          class="fav-btn starred panel-fav-btn"
          :title="
            isFavouriteStop(stop.id)
              ? 'Usuń z ulubionych'
              : 'Dodaj do ulubionych'
          "
          @click="toggleFavouriteStop(stop.id)"
        >
          {{ isFavouriteStop(stop.id) ? '★' : '☆' }}
        </button>
        <button
          class="panel-refresh"
          :class="{ spinning: loading }"
          title="Odśwież"
          @click="loadDepartures(stop.id, true)"
        >
          ↻
        </button>
        <button
          v-if="canClose"
          class="panel-close"
          title="Zamknij"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-if="loading && !departures.length" class="panel-loading">
      Ładowanie...
    </div>

    <div v-else-if="!loading && !departures.length" class="panel-empty">
      Brak odjazdów w najbliższym czasie
    </div>

    <div v-else class="dep-list-wrap">
      <transition name="skeleton-fade">
        <div v-if="loading" class="dep-skeleton-overlay" />
      </transition>

      <div class="dep-list">
        <div
          v-for="(departure, i) in sliceDepartures
            ? departures.slice(0, MAX_DEPARTURES)
            : departures"
          :key="i"
          class="dep-row"
        >
          <span class="dep-time-wrap">
            <span
              class="dep-time"
              :class="{
                'dep-time--now': departure.estimatedTimeString === 'teraz',
              }"
            >
              <transition name="pulse" mode="out-in">
                <span
                  v-if="departure.estimatedTimeString === 'teraz'"
                  class="dep-time--now"
                  :class="{ 'dep-time--dim': !showEstimated }"
                >
                  teraz
                </span>
                <span v-else :key="showEstimated ? 'str' : 'time'">
                  {{
                    showEstimated
                      ? departure.estimatedTimeString
                      : departure.estimatedTime
                  }}
                </span>
              </transition>
            </span>
            <sup
              v-if="Math.floor(Math.abs(departure.delaySeconds) / 60) !== 0"
              :title="
                departure.delaySeconds < 0
                  ? `Przyspieszenie ${Math.floor(Math.abs(departure.delaySeconds) / 60)} min`
                  : `Opóźnienie ${Math.floor(departure.delaySeconds / 60)} min`
              "
              class="dep-delay"
              :class="{
                'delay-early': departure.delaySeconds < 0,
                'delay-ok':
                  departure.delaySeconds > 0 && departure.delaySeconds <= 300,
                'delay-late': departure.delaySeconds > 300,
              }"
            >
              {{ departure.delaySeconds < 0 ? '-' : '+'
              }}{{ Math.floor(Math.abs(departure.delaySeconds) / 60) }}
            </sup>
            <span v-else class="dep-on-time" title="Punktualnie" />
          </span>
          <span
            class="dep-badge"
            :class="departure.routeId < 100 ? 'tram' : 'bus'"
          >
            {{ departure.routeName }}
          </span>
          <span class="dep-headsign">{{ departure.headsign }}</span>
        </div>
        <button
          v-if="departures.length > MAX_DEPARTURES && sliceDepartures"
          class="dep-more"
          @click.stop="(sliceDepartures = false), emit('expanded')"
        >
          + {{ departures.length - MAX_DEPARTURES }} kolejnych odjazdów
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useDepartures } from '@/composables/useDepartures'
import { useFavourites } from '@/composables/useFavourites'
import { useAuth } from '@/composables/useAuth'
import { useSynchronization } from '@/composables/useSynchronization'
import type { Stop } from '@/models/stop'

const MAX_DEPARTURES = 6
const sliceDepartures = ref(true)

const props = withDefaults(
  defineProps<{
    stop: Stop
    canClose?: boolean
    compact?: boolean
  }>(),
  {
    canClose: true,
    compact: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'expanded'): void
}>()

const { departures, loading, loadDepartures, clearDepartures } = useDepartures()

const { toggleFavouriteStop, isFavouriteStop } = useFavourites()
const { isLoggedIn } = useAuth()
const { showEstimated, refreshTick } = useSynchronization()

onMounted(async () => {
  await loadDepartures(props.stop.id)
})

onBeforeUnmount(() => {
  clearDepartures()
})

watch(refreshTick, () => {
  loadDepartures(props.stop.id)
})
</script>

<style scoped>
.fav-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.2);
  padding: 2px 4px;
  transition:
    color 0.15s,
    transform 0.15s;
  flex-shrink: 0;
}

.fav-btn:hover {
  color: #f3e891;
  transform: scale(1.2);
}

.fav-btn.starred {
  color: var(--nav-text-light);
}

/* ── Sekcja ulubionych ── */
.favourites-section-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(255, 255, 255, 0.25);
  padding: 4px 4px 0;
}

.fav-info {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--nav-text-lighter);
  padding: 4px 4px 0;
  text-align: center;
}
.departures-panel {
  width: 100%;
  background: var(--nav-bg);
  border-radius: 16px;
  overflow: visible;
  flex-shrink: 0;
  min-width: 300px;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.2s;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--stop-color);
  border-radius: 16px 16px 0 0;
}

.panel-stop-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--nav-text-light);
  white-space: nowrap;
  overflow: visible;
  text-overflow: ellipsis;
  flex: 1;
  height: 100%;
}

.panel-stop-subname {
  font-size: 12px;
  font-weight: 500;
  color: var(--nav-text-light);
  margin: 0 0 0 4px;
  flex: 1;
}

.panel-stop-name:hover {
  color: var(--nav-text-light);
  cursor: pointer;
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.panel-fav-btn,
.panel-refresh,
.panel-close {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
  font-size: 20px;
  color: var(--nav-text-lighter);
}

.panel-refresh:hover {
  color: var(--nav-text);
}

.panel-refresh.spinning {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.panel-close:hover {
  color: rgba(255, 255, 255, 0.9);
}

.panel-loading {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 20px;
  font-size: 12px;
  color: var(--nav-text-light);
  font-style: italic;
}

.panel-empty {
  font-size: 12px;
  color: var(--nav-text-lighter);
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.dep-list-wrap {
  position: relative;
}

.dep-skeleton-overlay {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(6px) brightness(0.7);
  background: rgba(13, 15, 20, 0.4);
  border-radius: 0 0 16px 16px;
  z-index: 1;
  pointer-events: none;
}

.skeleton-fade-enter-active {
  transition: opacity 0.6s ease;
}

.skeleton-fade-leave-active {
  transition: opacity 1.2s ease-in;
}
.skeleton-fade-enter-from,
.skeleton-fade-leave-to {
  opacity: 0;
}

.dep-list {
  padding: 8px 0;
}

.dep-list--compact {
  padding: 8px 0;
  max-height: 60vh;
  overflow-y: auto;
}

.dep-row {
  display: grid;
  grid-template-columns: 80px 30px 1fr;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

.dep-row:last-child {
  border-bottom: none;
}

.dep-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.dep-time {
  font-family: 'Space Mono', monospace;
  font-size: 11.7px;
  font-weight: 700;
  color: var(--nav-text);
}

.dep-time--now {
  animation: blink 1s ease-in-out infinite;
}

.pulse-enter-active,
.pulse-leave-active {
  transition: opacity 0.4s;
}
.pulse-enter-from,
.pulse-leave-to {
  opacity: 0;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

.dep-time-wrap {
  display: inline-flex;
  align-items: flex-start;
  gap: 2px;
}

.dep-delay {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78em;
  font-weight: 600;
  line-height: 1;
  vertical-align: super;
  position: relative;
  top: -0.3em;
  left: 0.2em;
}

.delay-early {
  color: #2cacb0;
}
.delay-ok {
  color: #f9e547;
}
.delay-late {
  color: #e74c3c;
}
.dep-on-time {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2ecc71;
  position: relative;
  top: -0.2em;
  left: 0.2em;
}

.dep-badge {
  font-size: 12.5px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 5px;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
}

.dep-badge.tram {
  background: var(--tram-color);
  color: var(--nav-text);
}

.dep-badge.bus {
  background: var(--bus-color);
  color: var(--nav-text);
}

.dep-headsign {
  font-size: 12px;
  color: var(--nav-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dep-more {
  width: 100%;
  font-size: 11.5px;
  color: var(--nav-text-lighter);
  text-align: center;
  padding: 8px 0 5px;
  font-style: italic;
}
.dep-more:hover {
  color: var(--nav-text);
  cursor: pointer;
}
</style>
