import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarRows, Legend, LineChart, Pie, Scatter, StatsRow } from '../components/Charts';
import { Chip, STATUS_DOT } from '../components/Chip';
import { Icon } from '../components/Icon';
import { MoreMenu } from '../components/common';
import { PageHead } from '../components/Header';
import { Reveal } from '../components/Reveal';
import { byAssignee, byCategory, completionByMonth, countByStatus, durationVariance, lastMonths, priorityShare } from '../lib/analytics';
import { addDays, fmt, todayIso } from '../lib/dates';
import { PEOPLE_BY_ID } from '../data/people';
import { SEED } from '../data/seed';
import { useWorkOrders } from '../store/store';
import type { WorkOrder } from '../types';

export const RANGES = [['all', 'All dates'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months']] as const;
export const inRange = (w: WorkOrder, range: string) => range === 'all' || (w.due >= addDays(todayIso(), -Number(range)) && w.due <= todayIso());

export function MiniSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: readonly (readonly [string, string])[]; label: string }) {
  return (
    <label className="mini-select"><select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><Icon name="chev" size={14} /></label>
  );
}

const PIE_COL: Record<string, string> = { None: 'var(--pie-1)', Low: 'var(--pie-2)', Medium: 'var(--pie-3)', High: 'var(--pie-4)' };

/** The maintenance charts, shared by the portfolio and single-building analytics pages. */
export function MaintenanceCharts({ lockedBuilding }: { lockedBuilding?: string }) {
  const all = useWorkOrders();
  const nav = useNavigate();
  const [building, setBuilding] = useState('');
  const [range, setRange] = useState('all');
  const scope = lockedBuilding ?? building;
  const inScope = useMemo(() => all.filter((w) => !scope || w.buildingId === scope), [all, scope]);
  const wos = useMemo(() => inScope.filter((w) => inRange(w, range)), [inScope, range]);
  const bOptions: [string, string][] = [['', 'All buildings'], ...SEED.buildings.map((b) => [b.id, b.name] as [string, string])];
  const controls = (withRange = true) => (
    <div className="selects">
      {!lockedBuilding && <MiniSelect value={building} onChange={setBuilding} options={bOptions} label="Building" />}
      {withRange && <MiniSelect value={range} onChange={setRange} options={RANGES} label="Date range" />}
    </div>
  );
  const months = lastMonths();
  const completion = completionByMonth(inScope);
  const variance = durationVariance(inScope);
  const prio = priorityShare(wos);
  const assignees = byAssignee(wos, 10);
  const categories = byCategory(wos, 10);
  return (
    <div className="col">
      <section className="card"><div className="card-h"><h3>Work orders in numbers</h3>{controls()}</div>
        <Reveal id="stats"><StatsRow values={countByStatus(wos)} /></Reveal></section>
      <section className="card"><div className="card-h"><h3>Work orders by assignee (Top 10 performers)</h3>{controls()}</div>
        <Reveal id="assignee"><BarRows rows={assignees} onOpen={(r) => nav(`/assignees/${r.key}`)} /><Legend /></Reveal>
        <div className="card-f"><Link className="txt-btn" to="/assignees">View all <Icon name="chevR" size={16} /></Link></div></section>
      <section className="card"><div className="card-h"><h3>Work orders by maintenance category (Top 10)</h3>{controls()}</div>
        <Reveal id="category"><BarRows rows={categories} /><Legend /></Reveal></section>
      <div className="two">
        <section className="card"><div className="card-h" style={{ display: 'block' }}><h3>Work orders by priority</h3><div style={{ marginTop: 4 }}>{controls()}</div></div>
          <Reveal id="pie" style={{ display: 'grid', placeItems: 'center', padding: 24 }}><Pie parts={prio.map((p) => ({ pct: p.pct, color: PIE_COL[p.priority], label: p.priority, textDark: p.priority === 'None' }))} /></Reveal>
          <Legend items={['None', 'Low', 'Medium', 'High'].map((l) => ({ label: l, color: PIE_COL[l] }))} /></section>
        <section className="card"><div className="card-h" style={{ display: 'block' }}><h3>Work orders completion rate over time</h3><div style={{ marginTop: 4 }}>{controls(false)}</div></div>
          <Reveal id="line" style={{ padding: '16px 16px 0' }}>
            <LineChart labels={months.map((m) => m.label)} series={[{ name: 'Other status', c: 'var(--grey-dot)', v: completion.map((c) => c.other) }, { name: 'Completed', c: 'var(--green)', v: completion.map((c) => c.completed) }]} />
          </Reveal>
          <Legend items={[{ label: 'Other status', color: 'var(--grey-dot)' }, { label: 'Completed', color: 'var(--green)' }]} /></section>
      </div>
      <section className="card"><div className="card-h"><h3>Completed work orders: time against estimate</h3>{controls(false)}</div>
        <Reveal id="scatter" style={{ padding: '16px 16px 0' }}><Scatter points={variance} labels={months.map((m) => m.label)} /></Reveal>
        <Legend items={[{ label: 'Within estimated duration', color: 'var(--grey-dot)' }, { label: 'Less than estimated duration', color: 'var(--green)' }, { label: 'More than estimated duration', color: 'var(--red)' }]} /></section>
    </div>
  );
}

export function RecentWorkOrders() {
  const all = useWorkOrders();
  const t = todayIso();
  const recent = useMemo(() => [...all].filter((w) => w.due <= t).sort((a, b) => b.due.localeCompare(a.due)).slice(0, 10), [all, t]);
  return (
    <section className="card"><div className="card-h"><h3>Recent work orders</h3></div>
      <div className="timeline">
        {recent.map((w) => (
          <Link key={w.id} className="tl" to={`/work-orders/${w.id}`} style={{ color: 'inherit' }}><span className="dot" style={{ background: STATUS_DOT[w.status] }} />
            <div><div className="meta"><span>{fmt(w.due)}</span><Chip status={w.status} /></div><b>{w.name}</b><small>Assignee: {PEOPLE_BY_ID[w.assigneeId]?.name}<br />{SEED.buildings.find((b) => b.id === w.buildingId)?.name}</small></div></Link>
        ))}
      </div></section>
  );
}

export function Analytics() {
  return (
    <main className="page"><PageHead title="Analytics" more={<MoreMenu />} />
      <div className="tabs solo"><Link className="tab on" to="/analytics">Building maintenance</Link><Link className="tab" to="/analytics/performance">Building performance</Link></div>
      <div className="dash"><MaintenanceCharts />
        <div className="col"><Link className="btn btn-primary" to="/calendar"><Icon name="cal" size={16} /> Schedule work order in calendar view</Link><RecentWorkOrders /></div></div></main>
  );
}

export const PerfEmpty = ({ what = 'all buildings' }: { what?: string }) => (
  <div className="empty-ill"><p>Building performance will show the energy performance of {what}, from meter and BMS data, and feed into ESG reporting. It is not part of this version of the demo.</p>
    <svg viewBox="0 0 900 200" width="100%" role="img" aria-label="Illustration of a city skyline with wind turbines">
      <g fill="none" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 190h900" /><path d="M80 190L120 60l40 130M95 140h50M105 105h30" /><path d="M200 190l28-95 28 95M210 150h36" />
        <path d="M330 190v-60l40-30 40 30v60M350 190v-30h20v30M385 150h15" /><path d="M640 190v-110l20-20h40v130M720 190V80h50v110M730 100h30M730 120h30M730 140h30M730 160h30" />
        <circle cx="560" cy="170" r="18" /><circle cx="830" cy="172" r="16" /><circle cx="290" cy="174" r="14" /></g>
      <g stroke="var(--green)" strokeWidth="3" strokeLinecap="round" opacity=".6"><path d="M470 190V90M470 90l-30-40M470 90l40-10M470 90l-6 44" /><path d="M530 190V60M530 60l-34-40M530 60l46-10M530 60l-8 50" /></g>
      <g stroke="var(--amber)" strokeWidth="3" opacity=".6" fill="none"><circle cx="820" cy="50" r="22" /><path d="M820 14v-10M820 96v-10M784 50h-10M866 50h-10" /></g>
    </svg></div>
);

export function AnalyticsPerf() {
  return (
    <main className="page"><PageHead title="Analytics" more={<MoreMenu />} />
      <div className="tabs solo"><Link className="tab" to="/analytics">Building maintenance</Link><Link className="tab on" to="/analytics/performance">Building performance</Link></div>
      <PerfEmpty /></main>
  );
}
