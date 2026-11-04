'use client';

import { useState } from 'react';
import type { GlossaryTerm } from '@/content/glossary';

/**
 * 术语悬停词典(T0-2):点击/悬停出双语一句话解释。
 * 移动端 hover 不可靠 → 用受控 open 状态,点击切换。
 */
export function Term({ term, locale }: { term: GlossaryTerm; locale: string }): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const label = locale === 'zh' ? term.zh : term.en;
  const def = locale === 'zh' ? term.def.zh : term.def.en;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="cursor-pointer rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] leading-none text-[var(--muted-foreground)] transition-colors duration-150 hover:border-[color-mix(in_oklab,var(--gold)_45%,var(--border))] hover:text-[var(--gold)]"
        aria-expanded={open}
      >
        {label}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-[3px] border border-[color-mix(in_oklab,var(--gold)_40%,var(--border))] bg-[var(--card)] p-3 text-[11px] leading-5 text-[var(--foreground)] shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
        >
          <b className="text-[var(--gold)]">{label}</b>
          <span className="mt-1 block">{def}</span>
        </span>
      )}
    </span>
  );
}
