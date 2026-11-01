import { createElement } from 'react';
import { ImageResponse } from 'next/og';
import { SHICHEN } from '@/lib/ziwei/constants';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * 命盘页动态 OG(T12):1200×630,环形意象简版 + 生辰 + 标语。
 * /api/og?y=1990&m=6&d=15&h=6&locale=zh
 */
export async function GET(request: Request): Promise<Response> {
  const sp = new URL(request.url).searchParams;
  const y = Number(sp.get('y'));
  const m = Number(sp.get('m'));
  const d = Number(sp.get('d'));
  const h = Number(sp.get('h'));
  const locale = sp.get('locale') === 'en' ? 'en' : 'zh';
  const zh = locale === 'zh';

  const birth = `${y} · ${m} · ${d} ${SHICHEN[h]?.name ?? ''}`;
  const brand = zh ? '璇玑' : 'Armilla';
  const tagline = zh ? '紫微斗数排盘' : 'Zi Wei Dou Shu Chart Casting';
  const slogan = zh ? '星有轨迹,盘有出处' : 'Every star placed. Every word sourced.';

  const ring = (r: number, color: string, width: number): React.ReactElement =>
    createElement('div', {
      style: {
        position: 'absolute', left: '50%', top: '50%',
        width: `${r}px`, height: `${r}px`, marginLeft: `${-r / 2}px`, marginTop: `${-r / 2}px`,
        border: `${width}px solid ${color}`, borderRadius: '9999px',
      },
    });

  const image = createElement('div', {
    style: {
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', background: 'linear-gradient(135deg, #17140f 0%, #100d0a 100%)',
      color: '#ece1c9', fontFamily: 'serif',
    },
  },
    ring(520, 'rgba(168,154,124,0.35)', 2),
    ring(460, 'rgba(92,107,82,0.55)', 26),
    ring(390, 'rgba(216,180,90,0.5)', 3),
    ring(300, 'rgba(92,107,82,0.35)', 18),
    ring(230, 'rgba(216,180,90,0.28)', 2),
    createElement('div', {
      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, zIndex: 1 },
    },
      createElement('div', { style: { fontSize: 64, letterSpacing: 14, color: '#d8b45a' } }, brand),
      createElement('div', { style: { fontSize: 30, letterSpacing: 6, color: '#a89a7c' } }, tagline),
      createElement('div', { style: { fontSize: 40, letterSpacing: 8, color: '#ece1c9' } }, birth),
      createElement('div', {
        style: {
          marginTop: 14, padding: '10px 34px', border: '1px solid rgba(216,180,90,0.45)',
          borderRadius: 999, fontSize: 24, letterSpacing: 6, color: '#d8b45a',
        },
      }, slogan),
    ),
  );

  return new ImageResponse(image, size);
}
