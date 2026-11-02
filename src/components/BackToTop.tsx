'use client';

import { useEffect, useState } from 'react';

/** 回到顶部(长页面 >3000px 时出现) */
export function BackToTop(): React.JSX.Element {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      setVisible(window.scrollY > 800);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return <></>;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--card)] text-[var(--gold)] shadow-lg transition-all duration-300 ease-qi hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]"
      aria-label="Back to top"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3L2 9M8 3L14 9M8 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
