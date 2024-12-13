import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dyform'
  },
  {
    path: '/image-editor',
    name: 'ImageEditor',
    component: () => import('../components/image/ImageEditor.vue')
  },
  {
    path: '/sokoban',
    name: 'Sokoban',
    component: () => import('../components/games/SokobanGame.vue')
  },
  {
    path: '/music-player',
    name: 'MusicPlayer',
    component: () => import('../components/MusicPlayer.vue')
  },
  {
    path: '/dyform',
    name: 'DyForm',
    component: () => import('../views/DyForm.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router