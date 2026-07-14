import App from '../App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '../style/style.css'
import router from '../router'

export function mountApp() {
  const app = createApp(App)

  app.use(ElementPlus)
  app.use(router)
  app.mount('#app')
}
