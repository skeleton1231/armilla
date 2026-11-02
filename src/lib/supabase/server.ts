import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 服务端 Supabase 客户端(T30,带 cookie session)
 * 未配置时返回 null(数据库操作静默跳过)
 */
export async function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component 里不能 set cookie,由 middleware 处理
        }
      },
    },
  });
}

/** 获取当前登录用户(未登录或未配置返回 null) */
export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
