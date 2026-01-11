import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '@core': '/src/core',
      '@objects': '/src/objects',
      '@controls': '/src/controls',
    },
  },
});
