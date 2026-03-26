import 'leaflet/dist/leaflet.css'
import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import logoutPlugin from './plugins/logoutPlugin'
import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const app = createApp(App)

app.use(router)
const pinia = createPinia()
app.use(pinia)

app.use(logoutPlugin)
app.use(ToastPlugin, {
  position: 'bottom-right',
  duration: 1000,
  dismissible: true,
})

app.mount('#app')
