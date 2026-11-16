import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/payments': 'http://127.0.0.1:3000',
      '/quotes': 'http://127.0.0.1:3000',
      '/readings': 'http://127.0.0.1:3000',
    },
  },
  build: {
    outDir: '../../dist/ui',
    emptyOutDir: true,
  },
});