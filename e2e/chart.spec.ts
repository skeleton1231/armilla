import { expect, test } from '@playwright/test';

/**
 * T13/T29:E2E 五条关键流
 * ① 公历排盘 ② 农历闰月排盘 ③ 时辰未知试排 ④ 切语言命盘保持 ⑤ 分享 URL 直开还原 + OG 存在
 * 口径:付费墙已上线 —— 免费层 = overview + personality + 同盘之日;付费维不渲染。
 */

const CAST_EN = 'button:has-text("Cast Chart")';
const CAST_ZH = 'button:has-text("排 盘")';

test('① solar form submit casts the canonical chart', async ({ page }) => {
  await page.goto('/en');
  await page.click(CAST_EN);
  await page.waitForURL(/\/en\/chart\?y=1990&m=6&d=15&h=6&g=m$/);
  // 传统 4×4 方阵:12 个宫格 + 盘芯
  await expect(page.locator('button[aria-label*="Life"]')).toBeVisible();
  const cells = page.locator('button[aria-label*="Palace"], button[aria-label*="Life"]');
  expect(await cells.count()).toBeGreaterThanOrEqual(12);
  // 免费层:恰好两个维度手风琴 + 付费墙
  await expect(page.locator('details')).toHaveCount(2);
  await expect(page.getByText('Unlock full report')).toBeVisible();
  await expect(page.locator('details#dim-wealth')).toHaveCount(0);
  await expect(page.locator('details#dim-career')).toHaveCount(0);
});

test('② lunar leap-month submit converts to canonical solar', async ({ page }) => {
  await page.goto('/zh');
  await page.click('button:has-text("农历")');
  await page.selectOption('select[name=m]', '5');
  // 1990 年闰五月:勾选闰月
  const leap = page.locator('label:has-text("闰5月") input');
  await expect(leap).toBeAttached();
  await leap.check();
  await page.waitForTimeout(600); // 换算预览 fetch
  await expect(page.getByText(/对应公历[::]1990-07/)).toBeVisible();
  await page.click(CAST_ZH);
  await page.waitForURL(/\/zh\/chart\?y=1990&m=7&d=7&h=6&g=m/);
  await expect(page.locator('button[aria-label*="命"]')).toBeVisible();
});

test('③ unknown hour casts noon with visible banner', async ({ page }) => {
  await page.goto('/en');
  await page.locator('label:has-text("Hour unknown") input').check();
  await page.click(CAST_EN);
  await page.waitForURL(/&u=1/);
  await expect(page.locator('p:has-text("Hour unknown · cast at noon hour")')).toBeVisible();
  await expect(page.locator('button[aria-label*="Life"]')).toBeVisible();
});

test('④ locale switch keeps the chart (params preserved)', async ({ page }) => {
  await page.goto('/zh/chart?y=1990&m=6&d=15&h=6&g=m');
  await expect(page.locator('button[aria-label*="命"]')).toBeVisible();
  await page.click('button:has-text("English")');
  await page.waitForURL(/\/en\/chart\?y=1990&m=6&d=15&h=6&g=m/);
  await expect(page.locator('button[aria-label*="Life"]')).toBeVisible();
  await page.click('button:has-text("中文")');
  await page.waitForURL(/\/zh\/chart\?y=1990&m=6&d=15&h=6&g=m/);
  await expect(page.locator('button[aria-label*="命"]')).toBeVisible();
});

test('⑤ share URL restores chart and OG image exists', async ({ page, request }) => {
  const url = '/zh/chart?y=1988&m=10&d=8&h=7&g=m';
  await page.goto(url);
  await expect(page.locator('button[aria-label*="命"]')).toBeVisible();
  // 黄金用例 #1:命宫天机(忌)+太阴(权)
  const mingCell = page.locator('button[aria-label*="命宫"]');
  await expect(mingCell).toContainText('天机');
  const og = await request.get('/api/og?y=1988&m=10&d=8&h=7&locale=zh');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');
});
