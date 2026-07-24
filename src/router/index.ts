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
    path: '/star',
    name: 'Star',
    component: () => import('../views/star/index.vue')
  },
  {
    path: '/idcard',
    name: 'IdCard',
    component: () => import('../views/idcard/index.vue')
  },
  {
    path: '/lolm',
    name: 'Lolm',
    component: () => import('../views/lolm/index.vue')
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
    path: '/bilibili-live',
    name: 'BilibiliLive',
    component: () => import('../views/bilibiliLive/index.vue')
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
  },
  {
    path: '/three-showcase/china-map',
    name: 'ThreeShowcaseChinaMap',
    component: () => import('../views/threeShowcase/chinaMap3d.vue')
  },
  {
    path: '/mapcn-showcase',
    name: 'MapcnShowcase',
    component: () => import('../views/mapcnShowcase/index.vue')
  },
  {
    path: '/antv-s2-examples',
    name: 'AntvS2Examples',
    component: () => import('../views/antvS2Examples/index.vue')
  },
  {
    path: '/antv-g6-examples',
    name: 'AntvG6Examples',
    component: () => import('../views/antvG6Examples/index.vue')
  },
  {
    path: '/antv-f2-examples',
    name: 'AntvF2Examples',
    component: () => import('../views/antvF2Examples/index.vue')
  },
  {
    path: '/antv-l7-examples',
    name: 'AntvL7Examples',
    component: () => import('../views/antvL7Examples/index.vue')
  },
  {
    path: '/feature',
    name: 'Feature',
    component: () => import('../views/feature/index.vue')
  },
  {
    path: '/web-components',
    name: 'WebComponents',
    component: () => import('../views/webComponents/index.vue')
  },
  {
    path: '/oat-ui',
    name: 'OatUi',
    component: () => import('../views/oatUi/index.vue')
  },
  {
    path: '/oat-studio',
    name: 'OatStudio',
    component: () => import('../views/oatStudio/index.vue')
  },
  {
    path: '/auth-showcase',
    name: 'AuthShowcase',
    component: () => import('../views/authShowcase/index.vue')
  },
  {
    path: '/cart-showcase',
    name: 'CartShowcase',
    component: () => import('../views/cartShowcase/index.vue')
  },
  {
    path: '/animation-showcase',
    name: 'AnimationShowcase',
    component: () => import('../views/animationShowcase/index.vue')
  },
  {
    path: '/motion-showcase',
    name: 'MotionShowcase',
    component: () => import('../views/motionShowcase/index.vue')
  },
  {
    path: '/schedule-x',
    name: 'ScheduleXShowcase',
    component: () => import('../views/scheduleXShowcase/index.vue')
  },
  {
    path: '/source-code',
    name: 'SourceCodeViewer',
    component: () => import('../views/sourceCode/index.vue')
  },
  {
    path: '/docker-showcase',
    name: 'DockerShowcase',
    component: () => import('../views/dockerShowcase/index.vue')
  },
  {
    path: '/200',
    name: 'Page200',
    component: () => import('../views/error/200.vue')
  },
  {
    path: '/401',
    name: 'Page401',
    component: () => import('../views/error/401.vue')
  },
  {
    path: '/402',
    name: 'Page402',
    component: () => import('../views/error/402.vue')
  },
  {
    path: '/403',
    name: 'Page403',
    component: () => import('../views/error/403.vue')
  },
  {
    path: '/404',
    name: 'Page404',
    component: () => import('../views/error/404.vue')
  },
  {
    path: '/405',
    name: 'Page405',
    component: () => import('../views/error/405.vue')
  },
  {
    path: '/500',
    name: 'Page500',
    component: () => import('../views/error/500.vue')
  },
  {
    path: '/permission',
    name: 'Permission',
    component: () => import('../views/permission/index.vue')
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('../views/logs/index.vue')
  },
  {
    path: '/xiaomi-shop',
    name: 'XiaomiShop',
    component: () => import('../views/xiaomiShop/index.vue')
  },
  {
    path: '/xiaomi-shop/detail/:id',
    name: 'XiaomiShopDetail',
    component: () => import('../views/xiaomiShop/detail.vue')
  },
  {
    path: '/xiaomi-shop/cart',
    name: 'XiaomiShopCart',
    component: () => import('../views/xiaomiShop/cart.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundCatchAll',
    component: () => import('../views/error/404.vue')
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
