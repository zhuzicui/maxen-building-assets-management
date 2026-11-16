import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const seen = new Set<string>();

/**
 * Chart entrance animation: the wrapper starts hidden (.armed) and plays (.play) once scrolled into view.
 * Each id plays once per visit to a screen, so re-renders (filters, accordions) never replay it.
 */
export function Reveal({ id, className, style, children }: { id: string; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'armed' | 'play'>(() => (reduced() || seen.has(id) || typeof IntersectionObserver === 'undefined' ? 'idle' : 'armed'));
  useLayoutEffect(() => { if (phase === 'armed') seen.add(id); }, [phase, id]);
  useEffect(() => {
    if (phase !== 'armed' || !ref.current) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); requestAnimationFrame(() => requestAnimationFrame(() => setPhase('play'))); } }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [phase]);
  useEffect(() => { if (phase !== 'play') return; const t = setTimeout(() => setPhase('idle'), 3200); return () => clearTimeout(t); }, [phase]);
  return <div ref={ref} className={`${phase === 'armed' ? 'armed' : phase === 'play' ? 'play' : ''} ${className ?? ''}`} style={style}>{children}</div>;
}
export const forgetReveals = () => seen.clear();

/** Counts up to a number the first time it is shown. */
export function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(reduced() ? value : 0);
  useEffect(() => {
    if (reduced()) { setShown(value); return; }
    const t0 = performance.now(), dur = 1100;
    let raf = 0;
    const step = (t: number) => { const p = Math.min(1, (t - t0) / dur); setShown(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown.toLocaleString('en-US')}</>;
}
