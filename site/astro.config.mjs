import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://buzzwin.com',
  trailingSlash: 'never',
  build: {
    format: 'file'
  }
});
