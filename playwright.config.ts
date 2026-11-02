import { defineConfig } from '@playwright/test';

/**
 * T29-①:E2E 五条关键流(T13 决议)。
 * 本机用系统 Chrome(channel:'chrome',免下载);CI 无 Chrome 时回落 bundled chromium。
 * 服务:对现有 .next 起独立 3320 端口,不与 3210 手工验证实例冲突。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3210',
    channel: 'chrome',
    locale: 'en-US',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx next start -p 3210',
    port: 3210,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
