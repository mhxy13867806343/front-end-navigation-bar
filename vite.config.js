import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
       base: './',
  plugins: [vue()],
                              base: './',
  resolve: {
    // alias: [//配置别名
    //  { find: '@', replacement: resolve(__dirname, 'src') }
    // ],
    alias:{
      '@':'/src'
    },
  }
})
