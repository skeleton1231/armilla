'use client';

import { useEffect, useState } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * 登录/用户菜单(T30,可选增强)
 * 未配置 Supabase 或未登录 → 不渲染(匿名体验零降级)
 */
export function AuthButton(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setReady(true); return; }
    const supabase = createClient();
    if (!supabase) { setReady(true); return; }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!ready || !user) return <></>;

  const email = user.email ?? '';
  const initial = email[0]?.toUpperCase() ?? '?';

  return (
    <div className="group relative">
      <button
        type="button"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--card)] text-xs font-semibold text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]"
        aria-label={`Account: ${email}`}
      >
        {initial}
      </button>
      <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 rounded-[3px] border border-[var(--border)] bg-[var(--popover)] p-3 opacity-0 shadow-xl transition-all duration-200 ease-qi group-hover:visible group-hover:opacity-100">
        <p className="truncate text-xs text-[var(--muted-foreground)]">{email}</p>
        <button
          type="button"
          onClick={() => createClient()?.auth.signOut()}
          className="mt-3 w-full cursor-pointer rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function LoginButton(): React.JSX.Element {
  if (!isSupabaseConfigured()) return <></>;
  return (
    <button
      type="button"
      onClick={() => {
        const supabase = createClient();
        supabase?.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      }}
      className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition-colors duration-150 hover:border-[var(--gold)] hover:text-[var(--gold)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in
    </button>
  );
}

/** 布局用:已登录显示头像菜单,未登录显示 Sign in,未配置不渲染 */
export function AuthArea(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setReady(true); return; }
    const supabase = createClient();
    if (!supabase) { setReady(true); return; }
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !isSupabaseConfigured()) return <></>;
  return user ? <AuthButton /> : <LoginButton />;
}
