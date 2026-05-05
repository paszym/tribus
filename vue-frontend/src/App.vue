<template>
  <Analytics />
  <div style="width: 100%; height: 100vh; display: flex; flex-direction: column">
    <div class="nav-wrapper desktop-nav">
      <nav class="nav-pill">
        <div class="nav-brand">
          <img src="./assets/logo.png" alt="TriBus" class="brand-img" />
          <span class="brand-name">TriBus</span>
        </div>
        <div class="nav-divider" />
        <div class="nav-links">
          <RouterLink to="/" class="nav-link" exact-active-class="active">
            Mapa na żywo
          </RouterLink>
          <RouterLink to="/stops" class="nav-link" exact-active-class="active">
            Odjazdy z przystanku
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
      <div class="mobile-brand-pill">
        <img src="./assets/logo.png" alt="TriBus" class="brand-img" />
        <span class="brand-name">TriBus</span>
      </div>

      <button
        class="hamburger-pill"
        :class="{ open: menuOpen }"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <span class="hb-line" />
        <span class="hb-line" />
        <span class="hb-line" />
      </button>

      <Transition name="menu-drop">
        <div v-if="menuOpen" class="mobile-dropdown" @click="menuOpen = false">
          <RouterLink to="/" class="mobile-menu-item" exact-active-class="active">
            Mapa na żywo
          </RouterLink>
          <RouterLink to="/stops" class="mobile-menu-item" exact-active-class="active">
            Odjazdy z przystanku
          </RouterLink>
          <div class="mobile-divider" />
          <template v-if="isLoggedIn">
            <span class="mobile-user-badge">
              <span class="user-dot" />
              {{ username }}
            </span>
            <button class="mobile-menu-item logout" @click.stop="logout(); menuOpen = false">
              <span class="menu-icon">↩</span>
              Wyloguj
            </button>
          </template>
          <RouterLink v-else to="/login" class="mobile-menu-item login" @click="menuOpen = false">
            Zaloguj się
          </RouterLink>
        </div>
      </Transition>
    </div>

    <RouterView style="flex: 1; min-height: 0" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { useAuth } from '@/composables/useAuth'

const { isLoggedIn, username, logout } = useAuth()
const menuOpen = ref(false)
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
  transition: color 0.18s, background 0.18s;
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
  0%, 100% { box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.25); }
  50%       { box-shadow: 0 0 0 5px rgba(46, 204, 113, 0); }
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
  transition: color 0.18s, border-color 0.18s, background 0.18s;
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

.hamburger-pill {
  pointer-events: all;
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 42px;
  height: 42px;
  background: rgba(13, 15, 20, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 0;
  transition: background 0.18s, border-color 0.18s;
}

.hamburger-pill:hover,
.hamburger-pill.open {
  background: rgba(30, 35, 45, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
}

.hb-line {
  display: block;
  width: 16px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 2px;
  transition: transform 0.22s ease, opacity 0.22s ease, width 0.22s ease;
  transform-origin: center;
}

.hamburger-pill.open .hb-line:nth-child(1) {
  transform: translateY(5.5px) rotate(45deg);
}
.hamburger-pill.open .hb-line:nth-child(2) {
  opacity: 0;
  width: 0;
}
.hamburger-pill.open .hb-line:nth-child(3) {
  transform: translateY(-5.5px) rotate(-45deg);
}

.mobile-dropdown {
  pointer-events: all;
  position: absolute;
  top: 62px;
  right: 12px;
  min-width: 220px;
  background: rgba(13, 15, 20, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.55),
    0 1px 0 rgba(255, 255, 255, 0.05) inset;
  padding: 6px;
  overflow: hidden;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  text-align: left;
}

.mobile-menu-item:hover,
.mobile-menu-item.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.mobile-menu-item.login {
  color: #fff;
  background: #1a5276;
  margin-top: 2px;
}

.mobile-menu-item.login:hover {
  background: #21618c;
}

.mobile-menu-item.logout {
  color: rgba(255, 100, 100, 0.7);
}

.mobile-menu-item.logout:hover {
  color: rgba(255, 100, 100, 1);
  background: rgba(255, 50, 50, 0.07);
}

.menu-icon {
  font-size: 15px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.mobile-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 4px 6px;
}

.mobile-user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}

/* Transition */
.menu-drop-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.menu-drop-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.menu-drop-enter-from,
.menu-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
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
