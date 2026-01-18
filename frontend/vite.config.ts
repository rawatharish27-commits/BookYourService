import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ============================================
// VITE CONFIGURATION
// ============================================
// Purpose: Configure Vite build and dev server
// Stack: Vite 5 + React + TypeScript
// Type: Production-Grade

export default defineConfig({
  base: "/",
  plugins: [react()],

  // Resolve paths
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },

  // Development server
  server: {
    port: 5173,
    host: true,
    open: false,
    historyApiFallback: true, // Important for SPA routing
  },

  // Preview server
  preview: {
    port: 4173,
    host: true,
  },
});
