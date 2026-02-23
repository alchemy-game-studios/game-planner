import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/graphql': 'http://localhost:3000',
      '/webhooks': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },
});
