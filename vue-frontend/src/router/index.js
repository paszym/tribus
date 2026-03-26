import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/stops',
      name: 'stops',
      component: () => import('../views/StopsView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      component: MainView,
    },
  ],
})

export default router
