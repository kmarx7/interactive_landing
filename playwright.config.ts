import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.ts',
  use: { baseURL: 'http://127.0.0.1:3000', viewport: { width: 1440, height: 1000 } },
  retries: 0,
  reporter: 'list',
});
