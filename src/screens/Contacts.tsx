import { useMemo, useState } from 'react';
import { ContactCard, MoreMenu } from '../components/common';
import { FilterRail, type FilterField } from '../components/FilterRail';
import { PageHead } from '../components/Header';
import { uniq } from '../lib/filters';
import { hashStr } from '../lib/rng';
import { EXTERNAL, HUDSON, INTERNAL } from '../data/people';
import { SEED } from '../data/seed';
import { useWorkOrders } from '../store/store';
import type { Person } from '../types';

interface F { search: string; building: string; type: string; supplier: string; title: string; disc: string }
const EMPTY: F = { search: '', building: '', type: '', supplier: '', title: '', disc: '' };

export function Contacts() {
  const wos = useWorkOrders();
  const [f, setF] = useState<F>(EMPTY);
  const set = <K extends keyof F>(k: K) => (v: F[K]) => setF((c) => ({ ...c, [k]: v }));
  // A person's building is the one they have the most work orders in; people with none get a stable pseudo-random one.
  const loc = useMemo(() => {
    const tally = new Map<string, Map<string, number>>();
    wos.forEach((w) => { const m = tally.get(w.assigneeId) ?? new Map<string, number>(); m.set(w.buildingId, (m.get(w.buildingId) ?? 0) + 1); tally.set(w.assigneeId, m); });
    return (p: Person) => {
      const m = tally.get(p.id);
      const id = m ? [...m.entries()].sort((a, b) => b[1] - a[1])[0][0] : SEED.buildings[hashStr('loc' + p.name) % SEED.buildings.length].id;
      return SEED.buildings.find((b) => b.id === id)!;
    };
  }, [wos]);
  const everyone = useMemo(() => [HUDSON, ...INTERNAL, ...EXTERNAL], []);
  const q = f.search.trim().toLowerCase();
  const match = (p: Person) =>
    (!f.building || loc(p).id === f.building) && (!f.type || (f.type === 'Internal') === p.internal) && (!f.supplier || p.company === f.supplier) && (!f.title || p.title === f.title) && (!f.disc || p.disc === f.disc) &&
    (!q || `${p.name} ${p.company} ${p.title} ${p.disc ?? ''} ${p.email}`.toLowerCase().includes(q));
  const internal = [HUDSON, ...INTERNAL].filter(match);
  const external = EXTERNAL.filter(match);
  const companies = uniq(external.map((p) => p.company));
  const active = Object.values(f).filter(Boolean).length;
  const fields: FilterField[] = [
    { t: 'search', value: f.search, set: set('search') }, { t: 'head', text: 'General' },
    { t: 'select', label: 'Building', value: f.building, set: set('building'), options: SEED.buildings.map((b) => ({ value: b.id, label: b.name })) },
    { t: 'select', label: 'Type', value: f.type, set: set('type'), options: ['Internal', 'External'] },
    { t: 'select', label: 'Supplier (company)', value: f.supplier, set: set('supplier'), options: uniq(EXTERNAL.map((p) => p.company)) },
    { t: 'select', label: 'Title', value: f.title, set: set('title'), options: uniq(everyone.map((p) => p.title)) },
    { t: 'select', label: 'Discipline', value: f.disc, set: set('disc'), options: uniq(everyone.map((p) => p.disc ?? '').filter(Boolean)) },
  ];
  return (
    <main className="page"><PageHead title="Contacts" more={<MoreMenu />} />
      <div className="split"><FilterRail fields={fields} activeCount={active} onReset={() => setF(EMPTY)} />
        <div className="col" style={{ gap: 32 }}>
          {!internal.length && !external.length && <p className="empty-state">No contacts match these filters.</p>}
          {internal.length > 0 && <div><h2 style={{ fontSize: 22, marginBottom: 16 }}>Internal ({internal.length})</h2><div className="cc-grid">{internal.map((p) => <ContactCard key={p.id} p={p} location={loc(p).short} />)}</div></div>}
          {external.length > 0 && <div className="col" style={{ gap: 20 }}><h2 style={{ fontSize: 22 }}>External ({external.length})</h2>
            {companies.map((c) => <div key={c}><h3 style={{ fontSize: 16, color: 'var(--fg-2)', marginBottom: 12 }}>{c}</h3><div className="cc-grid">{external.filter((p) => p.company === c).map((p) => <ContactCard key={p.id} p={p} location={loc(p).short} />)}</div></div>)}</div>}
        </div></div></main>
  );
}
