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
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-if="loading" class="panel-loading">Ładowanie...</div>

    <div v-else-if="!departures.length" class="panel-empty">
      Brak odjazdów w najbliższym czasie
    </div>

    <div v-else class="dep-list">
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
      <p
        v-if="departures.length > MAX_DEPARTURES && sliceDepartures"
        class="dep-more"
        @click="sliceDepartures = false"
      >
        + {{ departures.length - MAX_DEPARTURES }} kolejnych odjazdów
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'
import { useDepartures } from '@/composables/useDepartures'
import { useFavourites } from '@/composables/useFavourites'
import { useAuth } from '@/composables/useAuth'
import { useTimeFlip } from '@/composables/useTimeFlip'
import type { Stop } from '@/models/stop'

const MAX_DEPARTURES = 6
const sliceDepartures = ref(true)

const props = defineProps<{
  stop: Stop
  canClose?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const { departures, loading, loadDepartures, clearDepartures } = useDepartures()

const { toggleFavouriteStop, isFavouriteStop } = useFavourites()
const { isLoggedIn } = useAuth()
const { showEstimated } = useTimeFlip()

onMounted(async () => {
  await loadDepartures(props.stop.id)
})

onBeforeUnmount(() => {
  clearDepartures()
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
  color: #f9e547;
  transform: scale(1.2);
}

.fav-btn.starred {
  color: #f9e547;
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
  color: rgba(255, 255, 255, 0.25);
  padding: 4px 4px 0;
  text-align: center;
}
.departures-panel {
  width: 99%;
  background: rgba(13, 15, 20, 0.92);
  border-radius: 16px;
  overflow: visible;
  flex-shrink: 0;
}

/* Ulubiony panel – lekko inne obramowanie nagłówka */
.fav-panel .panel-header {
  border-bottom-color: rgba(249, 229, 71, 0.2);
  background: rgba(249, 229, 71, 0.05);
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
  border-bottom: 1px solid rgba(184, 134, 11, 0.3);
  background: rgba(184, 134, 11, 0.08);
  border-radius: 16px 16px 0 0;
}

.panel-stop-name {
  font-size: 14px;
  font-weight: 600;
  color: #f9e547;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.panel-stop-subname {
  font-size: 13px;
  font-weight: 500;
  color: #877a14;
  margin: 0 0 0 4px;
  flex: 1;
}

.panel-stop-name:hover {
  color: #f9e547cc;
  cursor: pointer;
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.panel-fav-btn {
  font-size: 14px;
  padding: 2px 4px;
}

.panel-refresh {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  font-size: 15px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  transition:
    color 0.15s,
    transform 0.15s;
}

.panel-refresh:hover {
  color: rgba(255, 255, 255, 0.7);
}

.panel-refresh.spinning {
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.panel-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition:
    color 0.15s,
    background 0.15s;
  flex-shrink: 0;
}

.panel-close:hover {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.07);
}

.panel-loading {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

.panel-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.dep-list {
  padding: 8px 0;
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
  color: rgba(255, 255, 255, 0.9);
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
  top: 0em;
  left: 0.5em;
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
  left: 0.35em;
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
  background: rgba(192, 57, 43, 0.25);
  color: #e88;
}

.dep-badge.bus {
  background: rgba(26, 82, 118, 0.35);
  color: #8af;
}

.dep-headsign {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dep-more {
  font-size: 11px;
  color: rgba(207, 207, 207, 0.421);
  text-align: center;
  padding: 8px 0 5px;
  font-style: italic;
}
.dep-more:hover {
  color: rgba(207, 207, 207, 0.7);
  cursor: pointer;
}
</style>
