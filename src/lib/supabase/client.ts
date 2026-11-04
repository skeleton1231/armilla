/**
 * 浏览器端 Supabase 轻量层(T30 → T11 包体修订)
 *
 * [T11 红线] client.ts 被布局级组件(AuthButton)静态引用 → 本文件禁止
 * 静态 import @supabase/ssr(≈100KB gz 会把全站 JS 撑爆 150KB 预算)。
 * - 环境探测/URL:零依赖导出
 * - createClient:动态加载 SDK,仅登出等真实需要时调用
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** 动态加载 @supabase/ssr(仅按需;绝不可被静态 import 链拉进首屏 bundle) */
export async function createClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !key) return null;
  const { createBrowserClient } = await import('@supabase/ssr');
  return createBrowserClient(SUPABASE_URL, key);
}
