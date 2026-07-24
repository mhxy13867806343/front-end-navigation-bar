import { createApp } from 'vue'
import App from '../App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../style/style.scss'
import router from '../router'
import Particles from "@tsparticles/vue3"
import { loadSlim } from "@tsparticles/slim"
import { initVersionPolling } from '../utils/versionPolling'

export function mountApp() {
  const app = createApp(App)

  app.use(ElementPlus)
  app.use(router)
  app.use(Particles, {
    init: async engine => {
      await loadSlim(engine);
    },
  })

  // 仅在生产环境挂载版本检测轮询库
  initVersionPolling()

  app.mount('#app')
}
