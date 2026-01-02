import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Enable JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],

  // Build configuration
  build: {
    target: 'esnext',
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          state: ['zustand'],
          api: ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // Server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
  },

  // Preview configuration
  preview: {
    port: 3000,
    host: true,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@store': '/src/store',
      '@types': '/src/types',
      '@api': '/src/api',
    },
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}));