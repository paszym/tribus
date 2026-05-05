<template>
  <Analytics />
  <div
    style="width: 100%; height: 100vh; display: flex; flex-direction: column"
  >
    <div class="nav-wrapper desktop-nav">
      <nav class="nav-pill">
        <RouterLink to="/">
          <div class="nav-brand">
            <img src="./assets/logo.png" alt="TriBus" class="brand-img" />
            <span class="brand-name">TriBus</span>
          </div>
        </RouterLink>
        <div class="nav-divider" />
        <div class="nav-links">
          <RouterLink to="/" class="nav-link" exact-active-class="active">
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
        </div>
      </nav>
    </div>

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

        <template v-if="isLoggedIn">
          <button
            class="mobile-icon-pill"
            aria-label="Wyloguj"
            @click="logout()"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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

const { isLoggedIn, username, logout } = useAuth()
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

/* DESKTOP */

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
  background: rgba(13, 15, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
  white-space: nowrap;
  max-width: 95vw;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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
  color: #ffffff;
  letter-spacing: 0.03em;
}

.nav-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 2px;
  flex-shrink: 0;
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

/* MOBILE */

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
  background: rgba(13, 15, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
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
  background: rgba(13, 15, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition:
    background 0.18s,
    border-color 0.18s,
    color 0.18s;
}

.mobile-icon-pill:hover {
  background: rgba(30, 35, 45, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.mobile-icon-pill.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
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
