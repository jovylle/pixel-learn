import { createRouter, createWebHistory } from 'vue-router'

import { useAppStore } from '@/stores/app'
import DashboardView from '@/views/DashboardView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PlaceholderView from '@/views/PlaceholderView.vue'
import WelcomeView from '@/views/WelcomeView.vue'

// Full route table per ROUTES_AND_COMPONENTS.md. Only /welcome and / (the
// dashboard) are fully built this pass; every other feature route renders
// the same PlaceholderView stub ("Coming soon") until its feature is built.
const routes = [
  { path: '/welcome', name: 'welcome', component: WelcomeView },
  { path: '/', name: 'dashboard', component: DashboardView },
  {
    path: '/bookworm',
    name: 'bookworm-library',
    component: PlaceholderView,
    meta: { title: 'Book worm', icon: 'book' },
  },
  {
    path: '/bookworm/:id',
    name: 'bookworm-reader',
    component: PlaceholderView,
    meta: { title: 'Book worm — Reader', icon: 'book' },
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: PlaceholderView,
    meta: { title: 'Pop up Quiz!', icon: 'lightning' },
  },
  {
    path: '/grammar',
    name: 'grammar-topics',
    component: PlaceholderView,
    meta: { title: 'Grammar', icon: 'pencil' },
  },
  {
    path: '/grammar/:id',
    name: 'grammar-lesson',
    component: PlaceholderView,
    meta: { title: 'Grammar — Lesson', icon: 'pencil' },
  },
  {
    path: '/listening',
    name: 'listening-list',
    component: PlaceholderView,
    meta: { title: 'Listening', icon: 'headphones' },
  },
  {
    path: '/listening/:id',
    name: 'listening-clip',
    component: PlaceholderView,
    meta: { title: 'Listening — Player', icon: 'headphones' },
  },
  {
    path: '/speaking',
    name: 'speaking-list',
    component: PlaceholderView,
    meta: { title: 'Speaking', icon: 'mic' },
  },
  {
    path: '/speaking/:id',
    name: 'speaking-practice',
    component: PlaceholderView,
    meta: { title: 'Speaking — Practice', icon: 'mic' },
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: PlaceholderView,
    meta: { title: 'Achievements', icon: 'trophy' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: PlaceholderView,
    meta: { title: 'Profile & Settings', icon: 'user' },
  },
  { path: '/:catchAll(.*)', name: 'not-found', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// First-run onboarding gate per ONBOARDING_AND_POLISH.md: no User yet ->
// force /welcome; once a User exists, /welcome is no longer the entry point.
router.beforeEach((to) => {
  const store = useAppStore()
  if (!store.hasUser && to.name !== 'welcome') {
    return { name: 'welcome' }
  }
  if (store.hasUser && to.name === 'welcome') {
    return { name: 'dashboard' }
  }
  return true
})

export default router
