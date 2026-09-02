import { defineConfig } from '@vben/vite-config';

const config: ReturnType<typeof defineConfig> = defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/fms-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/fms-api/, ''),
            target: 'http://localhost:9102/',
            ws: true,
          },
          '/mms-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/mms-api/, ''),
            target: 'http://localhost:9104/',
            ws: true,
          },
          '/sys-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/sys-api/, ''),
            target: 'http://localhost:9100/',
            ws: true,
          },
          '/zzhshopR2-api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/zzhshopR2-api/, ''),
            target: 'http://localhost:9108/',
            ws: true,
          },
          '/temu/v2': {
            changeOrigin: true,
            target: 'http://localhost:8092/',
            ws: true,
          },
        },
      },
    },
  };
});

export default config;
