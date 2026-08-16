import { defineConfig } from 'vite';
import baseConfig from './vite.config';

export default defineConfig(({ command }) => {
  const cfg: any = baseConfig;
  // Add a dev proxy to forward /api to local api-server during development
  if (process.env.NODE_ENV !== 'production') {
    cfg.server = {
      ...(cfg.server || {}),
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    };
  }
  return cfg;
});
