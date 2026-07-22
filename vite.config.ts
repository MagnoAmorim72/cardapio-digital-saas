import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração do Vite. O build gera assets com hash para cache-busting
// e usa chunking manual para separar vendor libs pesadas (framer-motion, supabase).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          motion: ['framer-motion'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
