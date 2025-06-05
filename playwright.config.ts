import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({
  path: `./env/.env.${process.env.ENV || 'qa'}`
});

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  globalTimeout: 60 * 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 10 : 1,

  // ⬇️ Use both Allure and HTML reporters
  reporter: [
    ['html', { open: 'never' }], 
    ['allure-playwright']
  ],

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        channel: 'chrome',
        headless: true,
          ...devices['Desktop Chromium'],
          viewport: null,
          launchOptions: {
            args: ["--start-maximized"]
          }
       },
    }
  ],

  globalSetup: require.resolve('./utils/globalSetup'),
});
