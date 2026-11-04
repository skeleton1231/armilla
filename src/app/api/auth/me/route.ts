import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * T11 包体配套:客户端 AuthArea/AuthButton 不再静态 import @supabase/ssr(≈100KB gz),
 * 会话探测改走本代理(服务端读 cookie → Auth API)。
 */
export async function GET(): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ email: null });

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => { /* 只读探测,不回写 */ },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return NextResponse.json({ email: user?.email ?? null });
}
