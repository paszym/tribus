<template>
  <Analytics />
  <div
    style="width: 100%; height: 100vh; display: flex; flex-direction: column"
  >
    <!-- DESKTOP NAV -->
    <div class="nav-wrapper desktop-nav">
      <nav class="nav-pill">
        <RouterLink :to="{ path: '/', query: router.currentRoute.value.query }">
          <div class="nav-brand">
            <img src="./assets/logo.png" alt="TriBus" class="brand-img" />
            <span class="brand-name">TriBus</span>
          </div>
        </RouterLink>
        <div class="nav-divider" />
        <div class="nav-links">
          <RouterLink
            :to="{ path: '/', query: router.currentRoute.value.query }"
            class="nav-link"
            exact-active-class="active"
          >
            Mapa na żywo
          </RouterLink>
          <RouterLink to="/stops" class="nav-link" exact-active-class="active">
            Tablica odjazdów
          </RouterLink>
        </div>
        <div class="nav-divider" />
        <div class="nav-right">
          <template v-if="isLoggedIn">
            <span class="user-badge">
              <span class="user-dot" />
              {{ username }}
            </span>
            <button class="nav-btn" @click="logout()">Wyloguj</button>
          </template>
          <RouterLink v-else to="/login" class="nav-btn primary">
            Zaloguj się
          </RouterLink>
          <div class="nav-divider" />
          <!-- THEME TOGGLE DESKTOP -->
          <button
            class="theme-toggle"
            :aria-label="isDark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'"
            @click="toggleTheme"
          >
            <!-- Sun -->
            <svg
              v-if="isDark"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
            <!-- Moon -->
            <svg
              v-else
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </nav>
    </div>

    <!-- MOBILE NAV -->
    <div class="mobile-nav">
      <RouterLink to="/">
        <div class="mobile-brand-pill">
          <img src="./assets/logo.png" alt="TriBus" class="brand-img" />
          <span class="brand-name">TriBus</span>
        </div>
      </RouterLink>

      <div class="mobile-icons">
        <RouterLink
          to="/"
          class="mobile-icon-pill"
          exact-active-class="active"
          aria-label="Mapa na żywo"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L3 6.5v14L9 17l6 3.5 6-3.5V3l-6 3.5L9 3z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
              fill="none"
            />
            <line
              x1="9"
              y1="3"
              x2="9"
              y2="17"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <line
              x1="15"
              y1="6.5"
              x2="15"
              y2="20.5"
              stroke="currentColor"
              stroke-width="1.8"
            />
          </svg>
        </RouterLink>

        <RouterLink
          to="/stops"
          class="mobile-icon-pill"
          exact-active-class="active"
          aria-label="Tablica odjazdów"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <line
              x1="7"
              y1="8"
              x2="17"
              y2="8"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <line
              x1="7"
              y1="12"
              x2="14"
              y2="12"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <line
              x1="9"
              y1="21"
              x2="15"
              y2="21"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <line
              x1="12"
              y1="17"
              x2="12"
              y2="21"
              stroke="currentColor"
              stroke-width="1.8"
            />
          </svg>
        </RouterLink>

        <!-- THEME TOGGLE MOBILE -->
        <button
          :aria-label="isDark ? 'Tryb jasny' : 'Tryb ciemny'"
          class="mobile-icon-pill"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <template v-if="isLoggedIn">
          <button
            class="mobile-icon-pill"
            aria-label="Wyloguj"
            @click="logout()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <polyline
                points="16 17 21 12 16 7"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </template>
        <RouterLink
          v-else
          to="/login"
          class="mobile-icon-pill"
          aria-label="Zaloguj się"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              stroke-width="1.8"
            />
          </svg>
        </RouterLink>
      </div>
    </div>

    <RouterView style="flex: 1; min-height: 0" />
  </div>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import router from './router'

const { isLoggedIn, username, logout } = useAuth()
const { isDark, toggleTheme } = useTheme()
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
  background: var(--body-bg);
  color: var(--body-color);
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

/* ── DESKTOP NAV ── */

.nav-wrapper {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  pointer-events: none;
}

.nav-pill {
  pointer-events: all;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: var(--border);
  border-radius: 40px;
  box-shadow:
    var(--nav-shadow),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
  white-space: nowrap;
  max-width: 95vw;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

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
  color: var(--brand-name);
  letter-spacing: 0.03em;
  transition: color 0.25s ease;
}

.nav-divider {
  width: 1px;
  height: 18px;
  background: var(--nav-divider);
  margin: 0 2px;
  flex-shrink: 0;
  transition: background 0.25s ease;
}

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
  color: var(--nav-text);
  text-decoration: none;
  border-radius: 30px;
  transition:
    color 0.18s,
    background 0.18s;
}

.nav-link:hover {
  color: var(--nav-text-hover);
  background: var(--nav-hover-bg);
}

.nav-link.active {
  color: var(--nav-text-active);
  background: var(--nav-active-bg);
}

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
  color: var(--user-badge);
  padding: 4px 10px;
  transition: color 0.25s ease;
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

.nav-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 13px;
  border-radius: 30px;
  border: 1px solid var(--nav-btn-border);
  background: transparent;
  color: var(--nav-btn-color);
  cursor: pointer;
  text-decoration: none;
  transition:
    color 0.18s,
    border-color 0.18s,
    background 0.18s;
}

.nav-btn:hover {
  color: var(--nav-btn-hover);
  border-color: var(--nav-btn-hover-border);
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

/* THEME TOGGLE */

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--nav-btn-border);
  background: transparent;
  color: var(--nav-btn-color);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition:
    color 0.18s,
    border-color 0.18s,
    background 0.18s;
}

.theme-toggle:hover {
  color: var(--nav-btn-hover);
  border-color: var(--nav-btn-hover-border);
  background: var(--nav-hover-bg);
}

/* ── MOBILE NAV ── */

.mobile-nav {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  pointer-events: none;
}

.mobile-brand-pill {
  pointer-events: all;
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px 7px 9px;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--nav-border);
  border-radius: 40px;
  box-shadow: var(--nav-shadow);
  transition:
    background 0.25s ease,
    border-color 0.25s ease;
}

.mobile-icons {
  pointer-events: all;
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.mobile-icon-pill {
  pointer-events: all;
  width: 42px;
  height: 42px;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--nav-border);
  border-radius: 50%;
  box-shadow: var(--nav-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: var(--nav-text);
  text-decoration: none;
  transition:
    background 0.18s,
    border-color 0.18s,
    color 0.18s;
}

.mobile-icon-pill:hover {
  background: var(--nav-hover-bg);
  border-color: var(--nav-btn-hover-border);
  color: var(--nav-text-hover);
}

.mobile-icon-pill.active {
  color: var(--nav-text-active);
  background: var(--nav-active-bg);
  border-color: var(--nav-btn-hover-border);
}

@media (max-width: 900px) {
  .desktop-nav {
    display: none;
  }
  .mobile-nav {
    display: block;
  }
}
</style>
