import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '../components/Chip';
import { WoCard, Accordion } from '../components/common';
import { PageHead } from '../components/Header';
import { Icon } from '../components/Icon';
import { toast } from '../ui';
import { MONTH_NAMES, addDays, iso, parse, todayIso } from '../lib/dates';
import { PEOPLE_BY_ID } from '../data/people';
import { SEED } from '../data/seed';
import { useBuilding, useStore, useWorkOrders } from '../store/store';
import type { Status, WorkOrder } from '../types';

const EV_CLASS: Record<Status, string> = { Overdue: 'red', 'On hold': 'amber', Planned: 'ghost', Ready: '', 'In progress': 'new', Completed: 'done' };
const VIEWS = ['Month', 'Week', 'Day'] as const;
type View = (typeof VIEWS)[number];

export function CalendarPage() {
  const b = useBuilding();
  const all = useWorkOrders();
  const { setBuilding, patchWO } = useStore();
  const nav = useNavigate();
  const [view, setView] = useState<View>('Month');
  const [anchor, setAnchor] = useState(todayIso());
  const [sel, setSel] = useState<string | null>(null);
  const [tip, setTip] = useState<{ wo: WorkOrder; x: number; y: number } | null>(null);
  const [dropDay, setDropDay] = useState<string | null>(null);
  const wos = useMemo(() => all.filter((w) => w.buildingId === b.id), [all, b.id]);
  const byDay = useMemo(() => { const m = new Map<string, WorkOrder[]>(); wos.forEach((w) => m.set(w.due, [...(m.get(w.due) ?? []), w])); return m; }, [wos]);
  const a = parse(anchor), y = a.getFullYear(), m = a.getMonth();
  const monthStart = iso(new Date(y, m, 1)), nextStart = iso(new Date(y, m + 1, 1)), nextEnd = iso(new Date(y, m + 2, 1));
  const prev = wos.filter((w) => w.status !== 'Completed' && w.due < monthStart).sort((p, q) => p.due.localeCompare(q.due));
  const planned = wos.filter((w) => w.status === 'Planned' && w.due >= monthStart && w.due < nextStart);
  const plannedNext = wos.filter((w) => w.status === 'Planned' && w.due >= nextStart && w.due < nextEnd);

  const schedule = (id: string, day: string) => {
    const wo = wos.find((w) => w.id === id);
    if (!wo || wo.due === day) return;
    patchWO(id, { due: day, ...(wo.status === 'Planned' ? { status: 'Ready' as Status } : {}) });
    setSel(null);
    toast(`${wo.name} scheduled for ${parse(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
  };
  const shift = (dir: number) => {
    const d = parse(anchor);
    if (view === 'Month') d.setMonth(d.getMonth() + dir); else d.setDate(d.getDate() + dir * (view === 'Week' ? 7 : 1));
    setAnchor(iso(d));
  };

  const event = (w: WorkOrder) => (
    <button key={w.id} className={`ev ${EV_CLASS[w.status]} ${sel === w.id ? 'sel' : ''}`} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)}
      onClick={() => { setTip(null); nav(`/work-orders/${w.id}`); }}
      onMouseEnter={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTip({ wo: w, x: r.right + 10 + 280 > window.innerWidth ? r.left - 290 : r.right + 10, y: Math.min(r.top, window.innerHeight - 260) }); }}
      onMouseLeave={() => setTip(null)} onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTip({ wo: w, x: Math.max(8, r.left), y: Math.min(r.bottom + 6, window.innerHeight - 260) }); }} onBlur={() => setTip(null)}>{w.name}</button>
  );
  const day = (date: string, out?: boolean, tall?: boolean) => {
    const list = byDay.get(date) ?? [];
    const d = parse(date);
    const max = tall ? 99 : 3;
    return (
      <div key={date} className={`day ${out ? 'out' : ''} ${date === todayIso() ? 'today' : ''} ${dropDay === date ? 'drop' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDropDay(date); }} onDragLeave={() => setDropDay(null)}
        onDrop={(e) => { e.preventDefault(); setDropDay(null); schedule(e.dataTransfer.getData('text/plain'), date); }}
        onClick={(e) => { if (sel && e.target === e.currentTarget) schedule(sel, date); }} data-day={date}>
        <div className="dn"><span>{d.getDate()}</span></div>
        {list.slice(0, max).map(event)}
        {list.length > max && <button className="ev-more" onClick={() => { setAnchor(date); setView('Day'); }}>+{list.length - max} more</button>}
        {sel && !out && list.length <= max && <button className="sr-only" onClick={() => schedule(sel, date)}>Schedule here</button>}
      </div>
    );
  };

  let body: React.ReactNode;
  if (view === 'Month') {
    const first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
    const total = Math.ceil((first + dim) / 7) * 7;
    body = <div className="cal">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div className="dow" key={d}>{d}</div>)}
      {Array.from({ length: total }, (_, i) => { const date = iso(new Date(y, m, i - first + 1)); return day(date, i - first + 1 < 1 || i - first + 1 > dim); })}</div>;
  } else if (view === 'Week') {
    const start = addDays(anchor, -a.getDay());
    body = <div className="wk">{Array.from({ length: 7 }, (_, i) => addDays(start, i)).map((date) => day(date, false, true))}</div>;
  } else {
    const list = byDay.get(anchor) ?? [];
    body = (
      <div className={`day ${dropDay === anchor ? 'drop' : ''}`} style={{ minHeight: 320, padding: 16 }} onDragOver={(e) => { e.preventDefault(); setDropDay(anchor); }} onDragLeave={() => setDropDay(null)} onDrop={(e) => { e.preventDefault(); setDropDay(null); schedule(e.dataTransfer.getData('text/plain'), anchor); }}>
        {list.length ? <div className="wo-grid">{list.map((w) => <WoCard key={w.id} wo={w} />)}</div> : <p className="empty-state">Nothing scheduled this day. Drag a work order here{sel ? ', or press the button below' : ''}.</p>}
        {sel && <button className="btn btn-primary" style={{ justifySelf: 'start' }} onClick={() => schedule(sel, anchor)}>Schedule selected work order here</button>}
      </div>
    );
  }
  const title = view === 'Month' ? `${MONTH_NAMES[m]} ${y}` : view === 'Week' ? `Week of ${parse(addDays(anchor, -a.getDay())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : parse(anchor).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const qi = (w: WorkOrder) => (
    <button key={w.id} className={`qi ${sel === w.id ? 'sel' : ''}`} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)} onClick={() => setSel(sel === w.id ? null : w.id)} aria-pressed={sel === w.id} title="Drag onto a day, or select it and then pick a day">
      <Chip status={w.status} /><b>{w.duration}</b><span>{w.name}</span></button>
  );
  return (
    <main className="page"><PageHead title="Schedule work order in calendar" back="/building/work-orders" backLabel="Back to work orders" />
      <div className="cal-layout"><div className="col" style={{ gap: 16 }}>
        <label className="field filled"><span className="fl">Building</span>
          <select aria-label="Building" value={b.id} onChange={(e) => { setBuilding(e.target.value); setSel(null); }}>{SEED.buildings.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><Icon name="chev" size={18} /></label>
        <Accordion title={`Work orders from previous months (${prev.length})`} open dim={!prev.length}><div className="queue">{prev.length ? prev.slice(0, 15).map(qi) : <p style={{ color: 'var(--fg-2)', margin: 0 }}>Nothing is waiting from earlier months.</p>}</div>{prev.length > 15 && <p style={{ fontSize: 12, color: 'var(--fg-2)', margin: '12px 0 0' }}>Showing the 15 oldest of {prev.length}.</p>}</Accordion>
        <Accordion title={`Work orders planned for ${MONTH_NAMES[m]} ${y} (${planned.length})`} open><div className="queue">{planned.length ? planned.map(qi) : <p style={{ color: 'var(--fg-2)', margin: 0 }}>All planned work orders are on the calendar.</p>}</div><p style={{ fontSize: 12, color: 'var(--fg-2)', margin: '12px 0 0' }}>Drag a work order onto a day to schedule it, or select it and click a day. Scheduling moves it from Planned to Ready.</p></Accordion>
        <Accordion title={`Work orders planned for ${MONTH_NAMES[(m + 1) % 12]} (${plannedNext.length})`}><div className="queue">{plannedNext.length ? plannedNext.map(qi) : <p style={{ color: 'var(--fg-2)', margin: 0 }}>None yet.</p>}</div></Accordion>
      </div>
        <section className="card" style={{ overflow: 'hidden' }}><div className="cal-h"><div className="seg2" role="group" aria-label="Calendar range">{VIEWS.map((v) => <button key={v} className={view === v ? 'on' : ''} aria-pressed={view === v} onClick={() => setView(v)}>{v}</button>)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button className="icon-btn" aria-label={`Previous ${view.toLowerCase()}`} onClick={() => shift(-1)}><Icon name="chevL" size={20} /></button><h3>{title}</h3><button className="icon-btn" aria-label={`Next ${view.toLowerCase()}`} onClick={() => shift(1)}><Icon name="chevR" size={20} /></button></div>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary btn-sm" onClick={() => setAnchor(todayIso())}>Take me to TODAY</button></div></div>
          <div className="cal-wrap">{body}</div></section></div>
      {tip && (
        <div className="ev-tip" style={{ left: Math.max(8, tip.x), top: tip.y }} role="tooltip"><Chip status={tip.wo.status} /><b>{tip.wo.name}</b>{tip.wo.description}<br />Building: {b.name}<br />Recurrence: {tip.wo.recurrence}<br />Assignee: {PEOPLE_BY_ID[tip.wo.assigneeId]?.name}<br />Estimated duration: {tip.wo.duration}<br />Due date: {tip.wo.due}<br />Priority: {tip.wo.priority}</div>
      )}
    </main>
  );
}
