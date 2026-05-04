import 'leaflet/dist/leaflet.css'
import './index.css'
import 'vue-toast-notification/dist/theme-default.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ToastPlugin from 'vue-toast-notification'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(ToastPlugin, {
  position: 'bottom-right',
  duration: 1000,
  dismissible: true,
})

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw-leaflet-cache.js')
    .then((reg) => console.log('SW registered:', reg.scope))
    .catch((err) => console.error('SW failed:', err))
}

app.mount('#app')
