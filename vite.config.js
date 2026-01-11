import { defineConfig } from 'vite';

export default defineConfig({
  // server: {
  //   open: true,
  // },
  css: {
    transformer: 'postcss',
    lightningcss: false
  },
  resolve: {
    alias: {
      '@core': '/src/core',
      '@objects': '/src/objects',
      '@controls': '/src/controls',
    },
  },

});
