import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { serverProxy } from './config/viteProxy.ts'

// https://vite.dev/config/
export default defineConfig({
       base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true
    })
  ],
  resolve: {
    alias:{
      '@':'/src'
    },
  },
  optimizeDeps: {
    exclude: ['@element-plus/icons-vue']
  },
  server: {
    proxy: serverProxy
  }
})
