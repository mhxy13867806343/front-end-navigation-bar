import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
       base: './',
  plugins: [vue()],
  resolve: {
    alias:{
      '@':'/src'
    },
  },
  server: {
    proxy: {
      '/api-news': {
        target: 'https://ai-bot.cn/daily-ai-news/',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/api-news/, '')
      },
      '/api-app-store': {
        target: 'https://ai-bot.cn/ai-app-store/',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/api-app-store/, '')
      },
      '/api-tutorials': {
        target: 'https://ai-bot.cn/ai-tutorials/',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/api-tutorials/, '')
      },
      '/api-qa': {
        target: 'https://ai-bot.cn/ai-question-and-answer/',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/api-qa/, '')
      },
      '/api-encyclopedia': {
        target: 'https://ai-bot.cn/ai-encyclopedia/',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/api-encyclopedia/, '')
      },
      '/api-hall-of-fame': {
        target: 'https://ai-bot.cn/ai-hall-of-fame/',
        changeOrigin: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        rewrite: (path) => path.replace(/^\/api-hall-of-fame/, '')
      }
    }
  }
})
