'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { SHICHEN } from '@/lib/ziwei/constants';
import { BRANCH_PINYIN } from '@/lib/interpret/canon';
import { CITY_LIST } from '@/lib/engine/cities';
import { encodeChartParams, type ChartParams } from '@/lib/engine/params';
import { Button } from '@/components/ui/button';

interface RecentEntry {
  label: string;
  q: string;
  savedAt: number;
}

const RECENT_KEY = 'xuanji_recent';
const YEARS: number[] = Array.from({ length: 2030 - 1900 + 1 }, (_, i) => 1900 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function solarExists(y: number, m: number, d: number): boolean {
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

const selectCls =
  'h-10 rounded-md border border-[var(--border)] bg-[var(--input)] px-2 text-sm text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--gold)_25%,transparent)] cursor-pointer';

export function BirthForm({ locale }: { locale: string }): React.JSX.Element {
  const t = useTranslations('form');
  const router = useRouter();

  const [cal, setCal] = useState<'solar' | 'lunar'>('solar');
  const [y, setY] = useState(1990);
  const [m, setM] = useState(6);
  const [d, setD] = useState(15);
  const [h, setH] = useState(6);
  const [hourUnknown, setHourUnknown] = useState(false);
  const [g, setG] = useState<'m' | 'f'>('m');
  const [city, setCity] = useState('');
  const [cityOpen, setCityOpen] = useState(false);

  const [leapMonth, setLeapMonth] = useState<number | null>(null); // 农历模式:该年闰几月
  const [useLeap, setUseLeap] = useState(false);
  const [converted, setConverted] = useState<{ y: number; m: number; d: number } | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as RecentEntry[]);
    } catch {
      /* localStorage 不可用则静默跳过(T05:最近盘是增强,不是依赖) */
    }
  }, []);

  // 农历模式:年份变化时取闰月信息(服务端换算,客户端不加载历法库)
  useEffect(() => {
    if (cal !== 'lunar') return;
    let alive = true;
    setConverting(true);
    fetch(`/api/lunar?ly=${y}&lm=1&ld=1`)
      .then((r) => r.json())
      .then((j: { valid: boolean; leapMonthOfYear?: number }) => {
        if (!alive) return;
        setLeapMonth(j.leapMonthOfYear ?? 0);
        setUseLeap(false);
      })
      .catch(() => alive && setLeapMonth(0))
      .finally(() => alive && setConverting(false));
    return () => {
      alive = false;
    };
  }, [cal, y]);

  // 农历模式:日期变化时换算并预览公历
  useEffect(() => {
    if (cal !== 'lunar') {
      setConverted(null);
      return;
    }
    let alive = true;
    setConverting(true);
    fetch(`/api/lunar?ly=${y}&lm=${m}&ld=${d}&leap=${useLeap ? 1 : 0}`)
      .then((r) => r.json())
      .then((j: { valid: boolean; y?: number; m?: number; d?: number }) => {
        if (!alive) return;
        if (j.valid && j.y) {
          setConverted({ y: j.y, m: j.m!, d: j.d! });
          setError(null);
        } else {
          setConverted(null);
          setError(t('errLunar'));
        }
      })
      .catch(() => alive && setError(t('errLunar')))
      .finally(() => alive && setConverting(false));
    return () => {
      alive = false;
    };
  }, [cal, y, m, d, useLeap, t]);

  // 点击外部关闭城市下拉
  useEffect(() => {
    const onClick = (e: MouseEvent): void => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const cityMatches = useMemo(() => {
    const q = city.trim();
    if (!q) return [];
    return CITY_LIST.filter((c) => c.name.includes(q)).slice(0, 8);
  }, [city]);

  const hourName = useMemo(() => SHICHEN[h]?.name ?? '', [h]);

  const submit = useCallback((): void => {
    setError(null);
    let solar: { y: number; m: number; d: number };
    if (cal === 'lunar') {
      if (!converted) {
        setError(t('errLunar'));
        return;
      }
      solar = converted;
    } else {
      if (!solarExists(y, m, d)) {
        setError(t('errDate'));
        return;
      }
      solar = { y, m, d };
    }
    const params: ChartParams = {
      y: solar.y,
      m: solar.m,
      d: solar.d,
      h: hourUnknown ? 6 : h,
      g,
      city: city.trim() || undefined,
      u: hourUnknown ? 1 : undefined,
    };
    const q = encodeChartParams(params);
    const label = `${solar.y}-${String(solar.m).padStart(2, '0')}-${String(solar.d).padStart(2, '0')} ${hourName}`;
    const next = [{ label, q, savedAt: Date.now() }, ...recent.filter((r) => r.q !== q)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* 同上:增强项 */
    }
    router.push(`/chart?${q}`);
  }, [cal, converted, y, m, d, h, hourUnknown, g, city, recent, hourName, t, router, locale]);

  const labelCls = 'block text-xs tracking-label text-[var(--muted-foreground)] mb-1.5';

  return (
    <div className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_1px_0_color-mix(in_oklab,var(--gold)_8%,transparent),0_14px_40px_rgb(0_0_0/0.5)]">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{t('title')}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-3">
          <span className={labelCls}>{t('calendar')}</span>
          <div className="inline-flex overflow-hidden rounded-md border border-[var(--border)]">
            {(['solar', 'lunar'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCal(mode)}
                className={`h-9 px-5 text-sm transition-colors duration-150 cursor-pointer ${
                  cal === mode
                    ? 'bg-[var(--gold)] text-[var(--primary-foreground)]'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {t(mode)}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className={labelCls}>{t('year')}</span>
          <select name="y" className={`${selectCls} w-full`} value={y} onChange={(e) => setY(Number(e.target.value))}>
            {YEARS.map((v) => (
              <option key={v} value={v}>{cal === 'lunar' ? `${v}` : v}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelCls}>{t('month')}</span>
          <select name="m" className={`${selectCls} w-full`} value={m} onChange={(e) => setM(Number(e.target.value))}>
            {MONTHS.map((v) => {
              const isLeap = cal === 'lunar' && leapMonth === v && useLeap;
              return <option key={v} value={v}>{isLeap ? t('leapMonth', { month: v }) : v}</option>;
            })}
          </select>
        </label>

        <label className="block">
          <span className={labelCls}>{t('day')}</span>
          <select name="d" className={`${selectCls} w-full`} value={d} onChange={(e) => setD(Number(e.target.value))}>
            {DAYS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

        {cal === 'lunar' && leapMonth !== null && leapMonth > 0 && (
          <div className="col-span-2 sm:col-span-3 text-xs text-[var(--muted-foreground)]">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useLeap}
                onChange={(e) => setUseLeap(e.target.checked)}
                className="accent-[var(--gold)]"
              />
              {t('leapMonth', { month: leapMonth })}
            </label>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>{t('hour')}</span>
          <select
            name="h"
            className={`${selectCls} w-full`}
            value={h}
            disabled={hourUnknown}
            onChange={(e) => setH(Number(e.target.value))}
          >
            {SHICHEN.map((s) => (
              <option key={s.branch} value={s.branch}>
                {locale === 'zh' ? `${s.name}(${s.range})` : `${BRANCH_PINYIN[s.branch]} Shi ${s.range}`}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className={labelCls}>{t('gender')}</span>
          <div className="inline-flex overflow-hidden rounded-md border border-[var(--border)]">
            {(['m', 'f'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setG(v)}
                className={`h-10 px-5 text-sm transition-colors duration-150 cursor-pointer ${
                  g === v
                    ? 'bg-[var(--bronze-deep)] text-[var(--foreground)]'
                    : 'bg-transparent text-[var(--muted-foreground)]'
                }`}
              >
                {t(v === 'm' ? 'male' : 'female')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <input
          type="checkbox"
          checked={hourUnknown}
          onChange={(e) => setHourUnknown(e.target.checked)}
          className="accent-[var(--gold)]"
        />
        {t('hourUnknown')}
        {hourUnknown && <span className="opacity-70"> · {t('hourUnknownHint')}</span>}
      </label>

      <div ref={cityRef} className="relative mt-3">
        <span className={labelCls}>{t('city')}</span>
        <input
          className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 focus:border-[var(--gold)] focus:outline-none"
          name="city"
          placeholder={t('cityPlaceholder')}
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setCityOpen(true);
          }}
          onFocus={() => setCityOpen(true)}
        />
        {cityOpen && cityMatches.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[var(--border)] bg-[var(--popover)] py-1 text-sm shadow-lg">
            {cityMatches.map((c) => (
              <li key={`${c.province}-${c.name}`}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[var(--muted)] cursor-pointer"
                  onClick={() => {
                    setCity(c.name);
                    setCityOpen(false);
                  }}
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{c.province}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 text-[12px] text-[var(--muted-foreground)]">{t('cityFallback')}</p>
      </div>

      {cal === 'lunar' && (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          {converting
            ? t('converting')
            : converted
              ? t('lunarPreview', { date: `${converted.y}-${String(converted.m).padStart(2, '0')}-${String(converted.d).padStart(2, '0')}` })
              : ' '}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-[var(--cinnabar)]">{error}</p>}

      <div className="mt-5">
        <Button size="lg" className="w-full" onClick={submit} disabled={converting && cal === 'lunar'}>
          {t('submit')}
        </Button>
      </div>

      {recent.length > 0 && (
        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <p className="mb-2 text-xs tracking-label text-[var(--muted-foreground)]">{t('recent')}</p>
          <ul className="space-y-1">
            {recent.map((r) => (
              <li key={r.q}>
                <button
                  type="button"
                  className="text-sm text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--gold)] hover:underline cursor-pointer"
                  onClick={() => router.push(`/chart?${r.q}`)}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
