import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import BigScreen from '../views/bigScreen/index.vue'

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
    path: '/terminal',
    name: 'Terminal',
    component: () => import('../views/DyForm.vue')
  },
  {
    path: '/runcode',
    name: 'RunCode',
    component: () => import('../views/runcode/index.vue')
  },
  {
    path: '/toolbox',
    name: 'Toolbox',
    component: () => import('../views/toolbox/index.vue')
  },
  {
    path: '/h5/:ticket',
    name: 'H5DesktopLink',
    component: () => import('../views/h5DesktopLink/index.vue')
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
  },
  {
    path: '/wechat-featured',
    name: 'WechatFeatured',
    component: () => import('../views/wechatFeatured/index.vue')
  },
  {
    path: '/weather',
    name: 'Weather',
    component: () => import('../views/weather/index.vue')
  },
  {
    path: '/api-center',
    name: 'ApiCenter',
    component: () => import('../views/apiCenter/index.vue')
  },
  {
    path: '/api-center/:category/:endpoint',
    name: 'ApiCenterDetail',
    component: () => import('../views/apiCenter/detail.vue')
  },
  {
    path: '/mingyan',
    name: 'Mingyan',
    component: () => import('../views/mingyan/index.vue')
  },
  {
    path: '/cocoloop',
    name: 'Cocoloop',
    component: () => import('../views/cocoloop/index.vue')
  },
  {
    path: '/cnblogs',
    name: 'Cnblogs',
    component: () => import('../views/cnblogs/index.vue')
  },
  {
    path: '/github-cn',
    name: 'GithubCn',
    component: () => import('../views/githubCn/index.vue')
  },
  {
    path: '/bilibili-trending',
    name: 'BilibiliTrending',
    component: () => import('../views/bilibiliTrending/index.vue')
  },
  {
    path: '/big-screen',
    name: 'BigScreen',
    component: BigScreen
  },
  {
    path: '/three-showcase',
    name: 'ThreeShowcase',
    component: () => import('../views/threeShowcase/index.vue')
  },
  {
    path: '/three-showcase/example/:id',
    name: 'ThreeShowcaseExample',
    component: () => import('../views/threeShowcase/example.vue')
  },
  {
    path: '/three-showcase/lab',
    name: 'ThreeShowcaseLab',
    component: () => import('../views/threeShowcase/lab.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const isMobileLikeClient = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false

  const userAgent: string = navigator.userAgent || ''
  const isMobileUserAgent: boolean = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent)
  const hasCoarsePointer: boolean = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const isNarrowScreen: boolean = window.matchMedia?.('(max-width: 820px)').matches ?? false

  return isMobileUserAgent || (hasCoarsePointer && isNarrowScreen)
}

const hasAllowedMobilePageAccess = (): boolean => {
  try {
    return sessionStorage.getItem('front_end_navigation_allow_mobile_page') === '1'
  } catch {
    return false
  }
}

const buildH5Ticket = (to: RouteLocationNormalized): string => {
  const pageName: string = to.path.replace(/^\/+/, '').replace(/[^a-zA-Z0-9-]+/g, '-') || 'home'
  return `${pageName}-${Date.now()}`
}

router.beforeEach((to: RouteLocationNormalized) => {
  if (!import.meta.env.PROD) return true
  if (to.path === '/h5' || to.path.startsWith('/h5/')) return true
  if (hasAllowedMobilePageAccess()) return true
  if (!isMobileLikeClient()) return true

  return {
    path: `/h5/${buildH5Ticket(to)}`,
    query: {
      target: to.fullPath
    },
    replace: true
  }
})

export default router
