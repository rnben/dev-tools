import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // 如果有前端资源需要构建，可以在这里配置
      // 对于纯模板插件，可能不需要构建任何前端资源
    },
  },
  optimizeDeps: {
    exclude: ['preload.js']
  }
})