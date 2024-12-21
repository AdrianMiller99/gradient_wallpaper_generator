import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/gradient_wallpaper_generator/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
