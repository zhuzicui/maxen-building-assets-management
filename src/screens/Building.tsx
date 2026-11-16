import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarRows, LineChart, Legend, Ring, StatsRow } from '../components/Charts';
import { Chip } from '../components/Chip';
import { Accordion, MoreMenu, WoCard, PRIORITY_CHIP } from '../components/common';
import { FilterRail, type FilterField } from '../components/FilterRail';
import { PageHead } from '../components/Header';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import { WoFilterRail, useWoFilters } from '../components/WoFilterRail';
import { MaintenanceCharts, PerfEmpty } from './Analytics';
import { WoBoard } from './WorkBoards';
import { byAssignee, completionByMonth, countByStatus, lastMonths, maintenanceScore } from '../lib/analytics';
import { fmt } from '../lib/dates';
import { EMPTY_ASSET_FILTERS, filterAssets, filterWorkOrders, openAssetIdsOf, uniq, type AssetFilters } from '../lib/filters';
import { floorLabels } from '../data/buildings';
import { HUDSON, INTERNAL, PEOPLE_BY_ID } from '../data/people';
import { roomsFor } from '../data/seed';
import { shuffle, rng } from '../lib/rng';
import { useAssets, useBuilding, useWorkOrders } from '../store/store';
import type { Asset, WorkOrder } from '../types';

const TABS: [string, string][] = [['/building', 'At a glance'], ['/building/analytics', 'Analytics'], ['/building/work-orders', 'Work orders'], ['/building/assets', 'Assets']];
function BuildingTabs({ on, sub }: { on: string; sub?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, borderRadius: 'var(--r)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div className="tabs" style={{ borderRadius: 0 }}>{TABS.map(([h, l]) => <Link key={h} className={`tab ${on === h ? 'on' : ''}`} to={h}>{l}</Link>)}</div>{sub}
    </div>
  );
}

function BuildingPhoto() {
  const b = useBuilding();
  if (b.photo) return <div className="building-photo" style={{ overflow: 'hidden' }}><img src={`${import.meta.env.BASE_URL}${b.photo}`} alt={`${b.name} at dusk`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 50%', display: 'block' }} /></div>;
  return (
    <div className="building-photo" role="img" aria-label={`Illustration of ${b.name}`}>
      <svg viewBox="0 0 320 180" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect y="95" width="320" height="85" fill="#6B8F71" /><path d="M0 70l60-6 70 4 60-8 70 6 60-4v40H0z" fill="#9DB6CC" />
        <polygon points="70,150 100,95 150,92 150,150" fill="#3E6B8C" /><polygon points="150,92 175,100 175,152 150,150" fill="#2C5270" /><rect x="180" y="110" width="70" height="40" fill="#E9EEF2" /><rect x="255" y="118" width="50" height="34" fill="#D3DCE3" /><rect x="20" y="120" width="40" height="30" fill="#C4CFD8" />
        <path d="M75 140h70M78 128h68M84 116h62M90 104h56" stroke="#7FA9C9" strokeWidth="1" /></svg>
    </div>
  );
}

function useBuildingWos() {
  const b = useBuilding();
  const all = useWorkOrders();
  return useMemo(() => all.filter((w) => w.buildingId === b.id), [all, b.id]);
}

export function BuildingHead() { const b = useBuilding(); return <PageHead title={b.name} more={<MoreMenu />} />; }

export function BuildingGlance() {
  const b = useBuilding();
  const wos = useBuildingWos();
  const nav = useNavigate();
  const score = maintenanceScore(wos), prev = maintenanceScore(wos, 60);
  const managers = useMemo(() => (b.id === 'b-radio-canada' ? [HUDSON, INTERNAL[0], INTERNAL[1], INTERNAL[2]] : shuffle(rng('mgr|' + b.id), INTERNAL).slice(0, 4)), [b.id]);
  const roles = ['Building manager', 'ESG Director', 'Property manager', 'Portfolio manager'];
  const months = lastMonths();
  const completion = completionByMonth(wos);
  const delta = score - prev;
  return (
    <main className="page"><BuildingHead /><BuildingTabs on="/building" />
      <div className="split"><div className="col" style={{ gap: 16 }}><BuildingPhoto />
        <div className="kv" style={{ gap: 8, fontSize: 13 }}><div>{b.desc}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="pinO" size={15} /> {b.addr}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} className="num"><Icon name="area" size={15} /> {b.area} sq.ft.</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="cal" size={15} /> {b.year}</div></div>
        <div className="card mgr">{managers.map((p, i) => <button key={p.id} onClick={() => nav('/contacts')}><div><b>{p.name}</b><span>{roles[i]}</span></div><Icon name="chev" size={18} /></button>)}</div></div>
        <div className="col"><h2 style={{ fontSize: 20 }}>Maintenance at a glance</h2>
          <div className="two" style={{ gridTemplateColumns: 'minmax(0,.7fr) minmax(0,1.3fr)' }}>
            <div className="score"><h3>Maintenance score</h3><small style={{ marginTop: -10 }}>Work orders due in the last 90 days</small>
              <Reveal id="ring" style={{ display: 'grid' }}><Ring score={score} /></Reveal>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><span style={{ background: 'rgba(255,255,255,.25)', borderRadius: '50%', width: 22, height: 22, display: 'grid', placeItems: 'center' }}><Icon name="trend" size={14} /></span>{delta >= 0 ? '+' : ''}{delta}% than 60 days ago</div>
              <small>Share of work orders that are not overdue.</small></div>
            <section className="card"><div className="card-h"><h3 style={{ fontSize: 16 }}>Work order completion rate</h3></div>
              <Reveal id="g-line" style={{ padding: '8px 16px 16px' }}><LineChart h={220} labels={months.map((m) => m.label)} series={[{ name: 'Completed', c: 'var(--primary)', v: completion.map((c) => c.completed) }]} /></Reveal></section></div>
          <section className="card"><div className="card-h"><h3 style={{ fontSize: 16 }}>Work orders in numbers</h3></div><Reveal id="g-stats"><StatsRow values={countByStatus(wos)} /></Reveal>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}><h3 style={{ fontSize: 16, padding: '0 24px' }}>Top 10 performers</h3>
              <Reveal id="g-bars"><BarRows rows={byAssignee(wos, 10)} onOpen={(r) => nav(`/assignees/${r.key}`)} /><Legend /></Reveal></div></section>
        </div></div></main>
  );
}

export function BuildingAnalytics() {
  const b = useBuilding();
  return (
    <main className="page"><BuildingHead />
      <BuildingTabs on="/building/analytics" sub={<div className="subtabs"><Link className="tab on" to="/building/analytics">Building maintenance</Link><Link className="tab" to="/building/performance">Building performance</Link></div>} />
      <MaintenanceCharts lockedBuilding={b.id} key={b.id} />
      <Link className="btn btn-primary" style={{ justifySelf: 'start', marginTop: 24 }} to="/calendar"><Icon name="cal" size={16} /> Schedule work order in calendar view</Link></main>
  );
}

export function BuildingPerf() {
  const b = useBuilding();
  return (
    <main className="page"><BuildingHead />
      <BuildingTabs on="/building/analytics" sub={<div className="subtabs"><Link className="tab" to="/building/analytics">Building maintenance</Link><Link className="tab on" to="/building/performance">Building performance</Link></div>} />
      <PerfEmpty what={b.name} /></main>
  );
}

/* ---------- work orders tab ---------- */
export function BuildingWorkOrders() {
  const b = useBuilding();
  const all = useWorkOrders();
  const assets = useAssets();
  const state = useWoFilters({ buildingId: b.id });
  const [view, setView] = useState<'list' | 'cards'>('list');
  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const assetById = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
  const list = useMemo(() => filterWorkOrders(all.filter((w) => w.buildingId === b.id), state.f, assetById, (id) => PEOPLE_BY_ID[id]?.name ?? '').sort((x, y) => y.due.localeCompare(x.due)), [all, b.id, state.f, assetById]);
  useEffect(() => setPage(0), [state.f, perPage, b.id]);
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const rows = list.slice(page * perPage, page * perPage + perPage);
  const nav = useNavigate();
  const goto = (w: WorkOrder) => nav(`/work-orders/${w.id}`);
  return (
    <main className="page"><BuildingHead /><BuildingTabs on="/building/work-orders" />
      <div className="split"><WoFilterRail state={state} locked={['buildingId']} key={b.id} />
        <div><div className="toolbar"><div className="seg" role="group" aria-label="View">
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><Icon name="list" size={18} /></button>
          <button className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')} aria-label="Card view" aria-pressed={view === 'cards'}><Icon name="grid" size={18} /></button></div>
          <div style={{ display: 'flex', gap: 8 }}><Link className="btn btn-soft" to="/new-work-order"><Icon name="plus" size={16} /> New work order</Link><Link className="btn btn-primary" to="/calendar"><Icon name="cal" size={16} /> Schedule work order in calendar view</Link></div></div>
          {view === 'list' ? (
            <section className="card" style={{ overflow: 'hidden' }}>
              <div className="table-wrap"><table className={dense ? 'dense' : ''}><thead><tr><th>Name</th><th>Assignee</th><th>Recurrence</th><th>Due date</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>{rows.map((w) => (
                  <tr key={w.id} className="link" tabIndex={0} onClick={() => goto(w)} onKeyDown={(e) => e.key === 'Enter' && goto(w)}>
                    <td>{w.name}</td><td>{PEOPLE_BY_ID[w.assigneeId]?.name}</td><td>{w.recurrence}</td><td className="num">{fmt(w.due)}</td><td><span className={`chip ${PRIORITY_CHIP[w.priority]}`}>{w.priority}</span></td><td><Chip status={w.status} /></td></tr>
                ))}</tbody></table>
                {!rows.length && <p className="empty-state">No work orders match these filters.</p>}</div>
              <div className="tfoot"><label className="switch"><input type="checkbox" checked={dense} onChange={(e) => setDense(e.target.checked)} />Dense</label>
                <div className="pg num"><span>Rows per page: <select aria-label="Rows per page" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} style={{ border: 0, background: 'transparent', fontWeight: 700 }}>{[10, 25, 50].map((n) => <option key={n}>{n}</option>)}</select></span>
                  <span>{list.length ? `${page * perPage + 1}–${Math.min(list.length, (page + 1) * perPage)} of ${list.length}` : '0 of 0'}</span>
                  <span style={{ display: 'flex', gap: 8 }}>
                    <button aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)} style={{ color: page === 0 ? 'var(--fg-3)' : 'var(--fg)' }}><Icon name="chevL" size={18} /></button>
                    <button aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} style={{ color: page >= pages - 1 ? 'var(--fg-3)' : 'var(--fg)' }}><Icon name="chevR" size={18} /></button></span></div></div>
            </section>
          ) : <WoBoard list={list} />}
        </div></div></main>
  );
}

/* ---------- assets tab ---------- */
export function BuildingAssets() {
  const b = useBuilding();
  const all = useAssets();
  const wos = useWorkOrders();
  const [wingIdx, setWingIdx] = useState(0);
  const [floor, setFloor] = useState('Floor 1');
  const [f, setF] = useState<AssetFilters>(EMPTY_ASSET_FILTERS);
  const wing = b.wings[Math.min(wingIdx, b.wings.length - 1)];
  const floors = floorLabels(wing);
  const floorNow = floors.includes(floor) ? floor : floors[0];
  useEffect(() => { setWingIdx(0); setFloor('Floor 1'); setF(EMPTY_ASSET_FILTERS); }, [b.id]);
  const inBuilding = useMemo(() => all.filter((a) => a.buildingId === b.id), [all, b.id]);
  const openIds = useMemo(() => openAssetIdsOf(wos), [wos]);
  const here = useMemo(() => inBuilding.filter((a) => a.wing === wing.name && a.floor === floorNow), [inBuilding, wing.name, floorNow]);
  const matches = useMemo(() => filterAssets(here, f, openIds), [here, f, openIds]);
  const rooms = useMemo(() => {
    const base = roomsFor(b, b.wings.indexOf(wing), floorNow);
    const extra = uniq(here.map((a) => a.room)).filter((r) => !base.includes(r));
    return [...base, ...extra];
  }, [b, wing, floorNow, here]);
  const set = <K extends keyof AssetFilters>(k: K) => (v: AssetFilters[K]) => setF((c) => ({ ...c, [k]: v }));
  const active = Object.entries(f).filter(([, v]) => v && v !== false).length;
  const fields: FilterField[] = [
    { t: 'search', value: f.search, set: set('search') }, { t: 'head', text: 'General' },
    { t: 'toggle', label: 'Has open work order', value: f.openWO, set: set('openWO') },
    { t: 'select', label: 'Brand', value: f.brand, set: set('brand'), options: uniq(inBuilding.map((a) => a.brand)) },
    { t: 'select', label: 'Model', value: f.model, set: set('model'), options: uniq(inBuilding.map((a) => a.model)) },
    { t: 'select', label: 'Installation year', value: f.year, set: set('year'), options: uniq(inBuilding.map((a) => String(a.year)), (x, y) => Number(y) - Number(x)) },
    { t: 'head', text: 'Category' },
    { t: 'select', label: 'Asset category', value: f.domain, set: set('domain'), options: uniq(inBuilding.map((a) => a.domain)) },
    { t: 'select', label: 'Asset type', value: f.type, set: set('type'), sub: true, options: uniq(inBuilding.filter((a) => !f.domain || a.domain === f.domain).map((a) => a.type)) },
  ];
  const tile = (a: Asset) => {
    const parent = a.parentId ? all.find((x) => x.id === a.parentId) : undefined;
    return (
      <Link key={a.id} className={`asset${parent ? ' has-par' : ''}`} to={`/assets/${a.id}`}>
        <span className="thumb" style={a.solar ? { background: 'linear-gradient(135deg,#9CC4E8 0 35%,#1E3A5F 35% 100%)' } : undefined}>{a.solar ? '' : <Icon name="img" size={18} />}</span>
        <span className="info"><b title={a.name}>{a.name}</b><span>{a.domain} / {a.type}</span></span>
        {parent && <><span className="par"><Icon name="tree" size={18} /></span><span className="tip"><b>Parent asset</b><br /><span style={{ color: 'var(--fg-2)' }}>{parent.name}</span></span></>}
      </Link>
    );
  };
  return (
    <main className="page"><BuildingHead />
      <BuildingTabs on="/building/assets" sub={<><div className="subtabs">{b.wings.map((w, i) => <button key={w.name} className={`tab ${wing.name === w.name ? 'on' : ''}`} onClick={() => { setWingIdx(i); setFloor('Floor 1'); }}>{w.name}</button>)}</div>
        <div className="subtabs deep">{floors.map((fl) => <button key={fl} className={`tab ${floorNow === fl ? 'on' : ''}`} onClick={() => setFloor(fl)}>{fl}</button>)}</div></>} />
      <div className="split"><FilterRail fields={fields} activeCount={active} onReset={() => setF(EMPTY_ASSET_FILTERS)} />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ color: 'var(--fg-2)', fontSize: 13 }}>{matches.length} of {here.length} assets on {wing.name}, {floorNow}</span>
            <Link className="btn btn-soft btn-sm" to="/new-asset"><Icon name="plus" size={16} /> New asset</Link></div>
          {rooms.map((r) => <RoomSection key={`${wing.name}|${floorNow}|${r}|${active ? 'f' : ''}`} room={r} assets={matches.filter((a) => a.room === r)} total={here.filter((a) => a.room === r).length} filtering={active > 0} render={tile} />)}
          {!matches.length && <p className="empty-state">No assets match these filters on this floor.</p>}
        </div></div></main>
  );
}

function RoomSection({ room, assets, total, filtering, render }: { room: string; assets: Asset[]; total: number; filtering: boolean; render: (a: Asset) => React.ReactNode }) {
  const [all, setAll] = useState(false);
  const max = 20;
  if (!assets.length && filtering) return null;
  const shown = all || assets.length <= max ? assets : assets.slice(0, max);
  return (
    <Accordion title={`${room} (${filtering && assets.length !== total ? `${assets.length} of ${total}` : total})`} open={room === 'Kitchen' || (filtering && assets.length > 0)} dim={!total}>
      <div className="asset-grid">{shown.map(render)}
        {assets.length > max && <button className="show-all" aria-expanded={all} onClick={() => setAll(!all)}>{all ? `Show fewer assets in ${room}` : `Show all ${assets.length} assets in ${room}`}</button>}</div>
    </Accordion>
  );
}

export { WoCard };
