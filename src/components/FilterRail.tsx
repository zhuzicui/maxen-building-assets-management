import { useEffect, useState } from 'react';
import { Icon } from './Icon';

type Opt = string | { value: string; label: string };
export type FilterField =
  | { t: 'search'; value: string; set: (v: string) => void }
  | { t: 'head'; text: string }
  | { t: 'select'; label: string; value: string; set: (v: string) => void; options: Opt[]; sub?: boolean }
  | { t: 'toggle'; label: string; value: boolean; set: (v: boolean) => void }
  | { t: 'dates'; from: string; to: string; setFrom: (v: string) => void; setTo: (v: string) => void };

const useNarrow = () => {
  const [narrow, setNarrow] = useState(() => matchMedia('(max-width:860px)').matches);
  useEffect(() => {
    const m = matchMedia('(max-width:860px)');
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
};

export function FilterRail({ fields, activeCount, onReset }: { fields: FilterField[]; activeCount: number; onReset: () => void }) {
  const narrow = useNarrow();
  const [open, setOpen] = useState(false);
  const closed = narrow && !open;
  return (
    <aside className={`card filters${closed ? ' closed' : ''}`} aria-label="Filters">
      <h3>Filters</h3>
      <button className="filters-toggle" aria-expanded={!closed} onClick={() => setOpen((o) => !o)}>
        <span>Filters{activeCount > 0 && <span className="badge">{activeCount}</span>}</span><Icon name="chev" size={18} />
      </button>
      {fields.map((f, i) => {
        if (f.t === 'head') return <div key={i} className="flabel">{f.text}</div>;
        if (f.t === 'search') return <label key={i} className="field"><Icon name="search" size={18} /><input placeholder="Search" aria-label="Search" value={f.value} onChange={(e) => f.set(e.target.value)} /></label>;
        if (f.t === 'toggle') return <label key={i} className="switch"><input type="checkbox" checked={f.value} onChange={(e) => f.set(e.target.checked)} />{f.label}</label>;
        if (f.t === 'dates') return (
          <div key={i} style={{ display: 'grid', gap: 12 }}>
            <label className="field filled date"><span className="fl">Due from</span><input type="date" value={f.from} onChange={(e) => f.setFrom(e.target.value)} aria-label="Due date from" /></label>
            <label className="field filled date"><span className="fl">Due to</span><input type="date" value={f.to} onChange={(e) => f.setTo(e.target.value)} aria-label="Due date to" /></label>
          </div>
        );
        return (
          <label key={i} className={`field ${f.value ? 'filled' : ''}`}>
            {f.value && <span className="fl">{f.label}</span>}{f.sub && <Icon name="sub" size={16} />}
            <select value={f.value} onChange={(e) => f.set(e.target.value)} aria-label={f.label}>
              <option value="">{f.label}</option>
              {f.options.map((o) => { const v = typeof o === 'string' ? o : o.value, l = typeof o === 'string' ? o : o.label; return <option key={v} value={v}>{l}</option>; })}
            </select>
            <Icon name="chev" size={18} />
          </label>
        );
      })}
      <div className="f-actions"><button className="txt-btn" style={{ color: activeCount ? 'var(--red)' : 'var(--fg-3)' }} onClick={onReset} disabled={!activeCount}>Reset filter</button></div>
    </aside>
  );
}
