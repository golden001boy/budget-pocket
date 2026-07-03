import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:  './tests',
  timeout:  30_000,
  retries:  process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL:       process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use:  { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command:            'pnpm dev',
        url:                'http://localhost:3000',
        reuseExistingServer: true,
        timeout:            60_000,
      },
});
