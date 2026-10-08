import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.svg', 'robots.txt'],
      manifest: {
        name: 'MDstash — Local Markdown Organizer',
        short_name: 'MDstash',
        description: 'Your markdown files, stashed, sorted, and ready to drop anywhere. Nothing leaves your device.',
        theme_color: '#6B7B6E',
        background_color: '#6B7B6E',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/logo.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}']
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-sanitize'],
          db: ['dexie', 'dexie-react-hooks', 'minisearch', 'fflate'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts']
  }
} as any);
