import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { serverProxy } from './config/viteProxy.js'

// https://vite.dev/config/
export default defineConfig({
       base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      dts: false,
      vueTemplate: true
    })
  ],
  resolve: {
    alias:{
      '@':'/src'
    },
  },
  server: {
    proxy: serverProxy
  }
})
