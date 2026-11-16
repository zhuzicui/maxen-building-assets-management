import { useLayoutEffect, useRef } from 'react';
import { CountUp } from './Reveal';
import { Chip } from './Chip';
import type { BarRow } from '../lib/analytics';
import type { Status } from '../types';
import { STATUSES } from '../types';

const BARCOL = ['var(--blue)', 'var(--amber)', 'var(--red)', 'var(--green)'];
const LEGEND = ['In progress', 'On hold', 'Overdue', 'Completed'];

export function Legend({ items }: { items?: { label: string; color: string }[] }) {
  const list = items ?? LEGEND.map((l, i) => ({ label: l, color: BARCOL[i] }));
  return <div className="legend">{list.map((it, i) => <span key={it.label} style={{ ['--d' as string]: `${500 + i * 80}ms` }}><i style={{ background: it.color }} />{it.label}</span>)}</div>;
}

export function BarRows({ rows, onOpen, max }: { rows: BarRow[]; onOpen?: (r: BarRow) => void; max?: number }) {
  const m = max ?? Math.max(1, ...rows.map((r) => r.total));
  if (!rows.length) return <p className="empty-state">No work orders match.</p>;
  return (
    <div className="bars">
      {rows.map((r, i) => (
        <div key={r.key} className={`bar-row ${onOpen ? 'click' : ''}`} style={{ ['--d' as string]: `${i * 55}ms` }} onClick={onOpen ? () => onOpen(r) : undefined} role={onOpen ? 'link' : undefined} tabIndex={onOpen ? 0 : undefined}
          onKeyDown={onOpen ? (e) => e.key === 'Enter' && onOpen(r) : undefined} title={`${r.name}: ${r.total}`}>
          <div className="bar-name"><b>{r.name}</b>{r.sub && <span>{r.sub}</span>}</div>
          <div className="bar-track" style={{ width: `${(r.total / m) * 100}%` }}>
            {r.counts.map((w, j) => (w ? <i key={j} style={{ flex: w, background: BARCOL[j] }} /> : null))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsRow({ values }: { values: number[] }) {
  return (
    <div className="stats num">
      {values.map((v, i) => <div key={i} className="stat" style={{ ['--d' as string]: `${200 + i * 70}ms` }}><b><CountUp value={v} /></b><Chip status={STATUSES[i] as Status} /></div>)}
    </div>
  );
}

export function LineChart({ labels, series, w = 520, h = 240, max = 100, ticks = [0, 20, 40, 60, 80, 100] }: { labels: string[]; series: { c: string; v: number[]; name: string }[]; w?: number; h?: number; max?: number; ticks?: number[] }) {
  const L = 36, R = 8, T = 10, B = 28, iw = w - L - R, ih = h - T - B;
  const n = labels.length;
  const x = (i: number) => L + (i * iw) / (n - 1), y = (v: number) => T + ih - (v / max) * ih;
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => { ref.current?.querySelectorAll<SVGPathElement>('path.ln').forEach((p) => { const len = Math.ceil(p.getTotalLength()); p.style.strokeDasharray = String(len); p.style.setProperty('--len', String(len)); }); });
  const curve = (pts: [number, number][]) => { let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`; } return d; };
  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={`Line chart by month: ${series.map((s) => s.name).join(', ')}`}>
      {ticks.map((t) => <g key={t}><line x1={L} x2={w - R} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray="3 3" /><text x={L - 8} y={y(t) + 4} fontSize="10" textAnchor="end">{t}</text></g>)}
      {labels.map((m, i) => <text key={i} x={x(i)} y={h - 8} fontSize="10" textAnchor="middle">{m}</text>)}
      {series.map((s, i) => (
        <g key={s.name}>
          <path className="ln" d={curve(s.v.map((v, j) => [x(j), y(v)]))} fill="none" stroke={s.c} strokeWidth="2" style={{ ['--d' as string]: `${i * 250}ms` }} />
          <circle className="ln-dot" cx={x(n - 1)} cy={y(s.v[n - 1])} r="4" fill="var(--paper)" stroke={s.c} strokeWidth="2" style={{ ['--d' as string]: `${1250 + i * 250}ms` }} />
        </g>
      ))}
    </svg>
  );
}

export function Pie({ parts }: { parts: { pct: number; color: string; label: string; textDark?: boolean }[] }) {
  const cx = 110, cy = 110, r = 100;
  let a = -Math.PI / 2;
  const total = parts.reduce((s, p) => s + p.pct, 0);
  return (
    <svg viewBox="0 0 220 220" width="220" style={{ maxWidth: '100%' }} role="img" aria-label={`Priority split: ${parts.map((p) => `${p.label} ${p.pct}%`).join(', ')}`}>
      {total === 0 && <circle cx={cx} cy={cy} r={r} fill="var(--line)" />}
      {parts.filter((p) => p.pct > 0).map((p, i) => {
        const a2 = a + (p.pct / total) * Math.PI * 2, lg = p.pct / total > 0.5 ? 1 : 0, m = (a + a2) / 2;
        const full = p.pct === total;
        const d = full ? '' : `M${cx},${cy} L${cx + r * Math.cos(a)},${cy + r * Math.sin(a)} A${r},${r} 0 ${lg} 1 ${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)} Z`;
        const el = (
          <g key={p.label}>
            {full ? <circle className="slice" cx={cx} cy={cy} r={r} fill={p.color} /> : <path className="slice" d={d} fill={p.color} stroke="var(--paper)" strokeWidth="1.5" style={{ ['--d' as string]: `${i * 120}ms` }} />}
            <text className="slice-label" x={cx + r * 0.62 * Math.cos(m)} y={cy + r * 0.62 * Math.sin(m) + 4} fontSize="11" textAnchor="middle" style={{ fill: p.textDark ? '#212B36' : '#fff', ['--d' as string]: `${500 + i * 120}ms` }}>{p.pct}%</text>
          </g>
        );
        a = a2;
        return el;
      })}
    </svg>
  );
}

export function Scatter({ points, labels, w = 960, h = 210, range = 10 }: { points: { id: string; x: number; v: number }[]; labels: string[]; w?: number; h?: number; range?: number }) {
  const L = 36, T = 10, B = 26, ih = h - T - B, iw = w - L - 8;
  const y = (v: number) => T + ih / 2 - (Math.max(-range, Math.min(range, v)) / range) * (ih / 2);
  const n = labels.length;
  const col = (v: number) => (v > 0.5 ? 'var(--red)' : v < -0.5 ? 'var(--green)' : 'var(--grey-dot)');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Hours over or under the estimate for completed work orders, by month">
      {[range, range / 2, 0, -range / 2, -range].map((t) => <g key={t}><text x={L - 8} y={y(t) + 4} fontSize="10" textAnchor="end">{t > 0 ? `+${t}` : t}</text><line x1={L} x2={w - 8} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeDasharray="3 3" /></g>)}
      {labels.map((m, i) => <text key={i} x={L + ((i + 0.5) * iw) / n} y={h - 6} fontSize="10" textAnchor="middle">{m}</text>)}
      {points.map((p) => <circle key={p.id} className="dot-pt" cx={L + (p.x * iw) / n + iw / n / 2 - 4} cy={y(p.v)} r="2.4" fill={col(p.v)} opacity=".6" style={{ ['--d' as string]: `${Math.round((p.x / n) * 1300)}ms` }}><title>{`${p.v > 0 ? '+' : ''}${p.v} h vs estimate`}</title></circle>)}
    </svg>
  );
}

export function Ring({ score }: { score: number }) {
  const r = 70, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 180 180" width="180" style={{ maxWidth: '100%', justifySelf: 'center' }} role="img" aria-label={`Maintenance score ${score} out of 100`}>
      <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="10" />
      <circle className="ring-arc" cx="90" cy="90" r={r} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} style={{ ['--c' as string]: c, ['--off' as string]: c * (1 - score / 100) }} transform="rotate(-90 90 90)" />
      <text x="90" y="72" textAnchor="middle" fontSize="12" style={{ fill: '#fff' }}>Maintenance score</text>
      <text x="90" y="104" textAnchor="middle" fontSize="34" fontWeight="700" style={{ fill: '#fff' }}>{score}</text>
      <text x="90" y="126" textAnchor="middle" fontSize="12" style={{ fill: '#fff' }}>{score >= 90 ? 'Excellent' : score >= 80 ? 'Very good' : score >= 70 ? 'Good' : 'Needs attention'}</text>
    </svg>
  );
}
