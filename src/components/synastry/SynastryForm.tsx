'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BRANCH_ZH, BRANCH_PINYIN } from '@/lib/interpret/canon';

interface Side { y: number; m: number; d: number; h: number; g: 'm' | 'f'; }

const DEFAULT_A: Side = { y: 1990, m: 6, d: 15, h: 6, g: 'm' };
const DEFAULT_B: Side = { y: 1992, m: 3, d: 20, h: 4, g: 'f' };
const YEARS = Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 1950 + i);

const sel = 'h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)]';
const lbl = 'block text-[11px] tracking-label text-[var(--muted-foreground)] mb-1';

/**
 * v1.1 合盘双生辰表单(公历口径;真太阳时城市修正留待 v1.2,缺省北京时区)。
 * 提交 → /{locale}/synastry?a=<query>&b=<query>
 */
export function SynastryForm({ locale }: { locale: string }): React.JSX.Element {
  const t = useTranslations('synastry');
  const [a, setA] = useState<Side>(DEFAULT_A);
  const [b, setB] = useState<Side>(DEFAULT_B);
  const hours = locale === 'zh' ? BRANCH_ZH : BRANCH_PINYIN;

  const go = (): void => {
    const qs = (s: Side): string => `y=${s.y}&m=${s.m}&d=${s.d}&h=${s.h}&g=${s.g}`;
    window.location.href = `/${locale}/synastry?a=${encodeURIComponent(qs(a))}&b=${encodeURIComponent(qs(b))}`;
  };

  const Panel = ({ title, side, set }: { title: string; side: Side; set: (s: Side) => void }): React.JSX.Element => (
    <div className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="mb-3 text-xs tracking-label text-[var(--gold)]">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div>
          <label className={lbl} htmlFor={`${title}-y`}>{t('year')}</label>
          <select id={`${title}-y`} className={sel} value={side.y} onChange={(e) => set({ ...side, y: Number(e.target.value) })}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor={`${title}-m`}>{t('month')}</label>
          <select id={`${title}-m`} className={sel} value={side.m} onChange={(e) => set({ ...side, m: Number(e.target.value) })}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor={`${title}-d`}>{t('day')}</label>
          <select id={`${title}-d`} className={sel} value={side.d} onChange={(e) => set({ ...side, d: Number(e.target.value) })}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor={`${title}-h`}>{t('hour')}</label>
          <select id={`${title}-h`} className={sel} value={side.h} onChange={(e) => set({ ...side, h: Number(e.target.value) })}>
            {hours.map((name, i) => <option key={i} value={i}>{name}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl} htmlFor={`${title}-g`}>{t('gender')}</label>
          <select id={`${title}-g`} className={sel} value={side.g} onChange={(e) => set({ ...side, g: e.target.value as 'm' | 'f' })}>
            <option value="m">{t('male')}</option>
            <option value="f">{t('female')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title={t('you')} side={a} set={setA} />
        <Panel title={t('them')} side={b} set={setB} />
      </div>
      <button
        type="button" onClick={go}
        className="h-11 cursor-pointer rounded-md bg-[var(--gold)] px-8 text-sm tracking-[0.15em] text-[var(--primary-foreground)] transition-colors duration-150 hover:bg-[var(--gold-bright)]"
      >
        {t('cast')}
      </button>
    </div>
  );
}

/** 结果页复制分享按钮(纯客户端) */
export function SynastryShare({ label, copied }: { label: string; copied: string }): React.JSX.Element {
  const [hit, setHit] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setHit(true); setTimeout(() => setHit(false), 1800);
        } catch { /* noop */ }
      }}
      className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[var(--gold)] px-4 text-xs tracking-wider text-[var(--gold)] transition-colors duration-150 hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]"
    >
      {hit ? copied : label}
    </button>
  );
}
