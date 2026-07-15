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
  },
  {
    path: '/flash',
    name: 'Flash',
    component: () => import('../views/flash/index.vue')
  },
  {
    path: '/aicoding',
    name: 'AiCoding',
    component: () => import('../views/aicoding/index.vue')
  },
  {
    path: '/helloworld',
    name: 'HelloWorld',
    component: () => import('../views/helloworld/index.vue')
  },
  {
    path: '/juejin-theme',
    name: 'JuejinTheme',
    component: () => import('../views/juejinTheme/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router