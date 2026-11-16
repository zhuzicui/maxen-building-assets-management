import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Chip } from '../components/Chip';
import { ContactCard, NotesCard } from '../components/common';
import { PageHead } from '../components/Header';
import { Icon } from '../components/Icon';
import { toast } from '../ui';
import { addDays, fmt, todayIso } from '../lib/dates';
import { PEOPLE_BY_ID } from '../data/people';
import { SEED } from '../data/seed';
import { useAsset, useAssets, useWorkOrders } from '../store/store';

const TABS = ['Work orders', 'Documents', 'Checklists', 'Sub-assets'] as const;

function SolarPhoto() {
  return (
    <div className="solar-photo" role="img" aria-label="Solar panels under a blue sky"><svg viewBox="0 0 320 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4C8DD6" /><stop offset="1" stopColor="#BFD9F2" /></linearGradient></defs>
      <rect width="320" height="200" fill="url(#sky)" /><ellipse cx="60" cy="40" rx="50" ry="18" fill="#fff" opacity=".8" /><ellipse cx="260" cy="30" rx="40" ry="14" fill="#fff" opacity=".7" /><polygon points="0,200 0,150 320,40 320,200" fill="#1B2D4A" />
      <g stroke="#6F8DB5" strokeWidth="1.2" opacity=".8">{Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 40} y1={200} x2={i * 40 + 60} y2={150 - i * 12} />)}{Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1="0" y1={160 + i * 10} x2="320" y2={50 + i * 28} />)}</g></svg></div>
  );
}

export function AssetPage() {
  const { id } = useParams();
  const asset = useAsset(id);
  const all = useAssets();
  const wos = useWorkOrders();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Work orders');
  const linked = useMemo(() => wos.filter((w) => w.assetIds.includes(id ?? '')).sort((a, b) => b.due.localeCompare(a.due)), [wos, id]);
  const children = useMemo(() => all.filter((a) => a.parentId === id), [all, id]);
  if (!asset) return <Navigate to="/building/assets" replace />;
  const b = SEED.buildings.find((x) => x.id === asset.buildingId);
  const parent = asset.parentId ? all.find((a) => a.id === asset.parentId) : undefined;
  const w = asset.warranty;
  const wState = !w ? null : w.end < todayIso() ? { t: 'Expired', c: 'c-red' } : w.end < addDays(todayIso(), 180) ? { t: 'Expires soon', c: 'c-amber' } : { t: 'Active', c: 'c-green' };
  const tasksByWo = linked.map((l) => ({ wo: l, tasks: l.groups.filter((g) => g.assetId === asset.id).flatMap((g) => g.tasks) })).filter((x) => x.tasks.length);
  const seen = new Set<string>();
  const checklist = tasksByWo.filter((x) => { const k = x.wo.name; if (seen.has(k)) return false; seen.add(k); return true; });
  return (
    <main className="page"><PageHead title={asset.name} back="/building/assets" backLabel="Back to assets" />
      <div className="tri"><div>
        {asset.solar ? <SolarPhoto /> : <div className="solar-photo" role="img" aria-label="No photo yet" style={{ background: 'var(--s-grey-bg)', display: 'grid', placeItems: 'center', color: 'var(--fg-3)' }}><Icon name="img" size={40} /></div>}
        {asset.description && <p style={{ margin: '16px 0' }}>{asset.description}</p>}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><span className="btn btn-soft btn-sm" style={{ background: 'var(--field)', borderRadius: 16 }}>{asset.domain}</span><span className="btn btn-soft btn-sm" style={{ background: 'var(--field)', borderRadius: 16 }}>{asset.type}</span></div>
        <div className="sec-label">Location</div><div className="kv"><div><b>Building:</b> {b?.name}</div><div><b>Wing:</b> {asset.wing}</div><div><b>Floor:</b> {asset.floor}</div><div><b>Room:</b> {asset.room}</div>{parent && <div><b>Parent asset:</b> <Link to={`/assets/${parent.id}`} style={{ color: 'var(--primary)' }}>{parent.name}</Link></div>}</div>
        <div className="sec-label">Identifier</div><div className="kv"><div><b>Brand:</b> {asset.brand}</div><div><b>Model:</b> {asset.model}</div><div><b>Installation year:</b> {asset.year}</div></div>
        <div className="sec-label">Warranty</div>
        {w && wState ? <div className="kv"><div><span className={`chip ${wState.c}`}>{wState.t}</span></div><div><b>Provider:</b> {w.provider}</div><div><b>Valid:</b> {fmt(w.start)} to {fmt(w.end)}</div></div> : <div className="kv"><div style={{ color: 'var(--fg-2)' }}>No warranty on record</div></div>}
        <div className="sec-label">Specifications</div><div className="kv num">{asset.specs.length ? asset.specs.map((s) => <div key={s.name}><b>{s.name}:</b> {s.value}</div>) : <div style={{ color: 'var(--fg-2)' }}>No specifications recorded</div>}</div>
        {asset.contactIds.length > 0 && <><div className="sec-label">Contact</div><div className="col" style={{ gap: 12 }}>{asset.contactIds.map((cid) => PEOPLE_BY_ID[cid] && <ContactCard key={cid} p={PEOPLE_BY_ID[cid]} bare />)}</div></>}
      </div>
        <section className="card" style={{ overflow: 'hidden' }}>
          <div className="tabs" style={{ background: 'var(--field)', borderRadius: 0 }} role="tablist">{TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'on' : ''}`} style={{ fontSize: 14 }} onClick={() => setTab(t)}>{t === 'Documents' ? `Documents (${asset.docs.length})` : t === 'Sub-assets' ? `Sub-assets (${children.length})` : t}</button>)}</div>
          <div style={{ padding: 20, display: 'grid', gap: 8 }}>
            {tab === 'Work orders' && <>
              {linked.length === 0 && <p className="empty-state">No work orders on this asset yet.</p>}
              {linked.slice(0, 12).map((l) => <Link key={l.id} className="wo-item" to={`/work-orders/${l.id}`} style={{ color: 'inherit' }}><span><Chip status={l.status} /></span><b style={{ fontWeight: 500 }}>{l.name}</b><span>{l.description}</span><small>{l.recurrence} • Due {fmt(l.due)}</small></Link>)}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><Link className="btn btn-primary" to={`/new-work-order?asset=${asset.id}`}><Icon name="plus" size={18} /> New work order</Link><Link to="/building/work-orders" style={{ fontWeight: 700 }}>View all work orders</Link></div></>}
            {tab === 'Documents' && asset.docs.map((d) => <button key={d.name} onClick={() => toast('Document previews are not part of this demo')} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--line)', textAlign: 'left' }}><span>{d.name}</span><small style={{ color: 'var(--fg-2)' }}>{d.kind}</small></button>)}
            {tab === 'Checklists' && (checklist.length ? checklist.map(({ wo, tasks }) => <div key={wo.id} style={{ display: 'grid', gap: 4 }}><b>{wo.name} <span style={{ color: 'var(--fg-2)', fontWeight: 400 }}>· {wo.recurrence}</span></b>{tasks.map((t) => <div key={t.id} className="task"><span style={{ textDecoration: 'none', color: 'var(--fg)' }}>• {t.text}</span></div>)}</div>) : <p className="empty-state">No checklists for this asset yet.</p>)}
            {tab === 'Sub-assets' && (children.length ? <div className="asset-grid" style={{ gridTemplateColumns: '1fr' }}>{children.map((c) => <Link key={c.id} className="asset" to={`/assets/${c.id}`}><span className="thumb"><Icon name="img" size={18} /></span><span className="info"><b>{c.name}</b><span>{c.domain} / {c.type}</span></span></Link>)}</div> : <p className="empty-state">No sub-assets.</p>)}
          </div></section>
        <NotesCard kind="asset" id={asset.id} notes={asset.notes} />
      </div></main>
  );
}
