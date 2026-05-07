import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MapView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: { title: 'Mapa na żywo | TriBus' },
      component: MainView,
    },
    {
      path: '/login',
      name: 'login',
      meta: { title: 'Logowanie | TriBus' },
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/stops',
      name: 'stops',
      meta: { title: 'Tablica odjazdów | TriBus' },
      component: () => import('@/views/StopsView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: { title: 'Rejestracja | TriBus' },
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      meta: { title: 'Wylogowanie | TriBus' },
      component: MainView,
    },
  ],
})
router.afterEach((to) => {
  document.title = (to.meta.title as string) ?? 'TriBus'
})
export default router
