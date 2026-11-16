import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { BarRows, Legend } from '../components/Charts';
import { Accordion, MoreMenu, WoCard } from '../components/common';
import { PageHead } from '../components/Header';
import { Reveal } from '../components/Reveal';
import { WoFilterRail, useWoFilters } from '../components/WoFilterRail';
import { byAssignee } from '../lib/analytics';
import { filterWorkOrders, type WoFilters } from '../lib/filters';
import { PEOPLE_BY_ID } from '../data/people';
import { useAssets, useCurrentUser, useWorkOrders } from '../store/store';
import type { Status, WorkOrder } from '../types';

const GROUPS: { status: Status; open: boolean }[] = [
  { status: 'Planned', open: false }, { status: 'Ready', open: false }, { status: 'In progress', open: true }, { status: 'On hold', open: true }, { status: 'Overdue', open: true }, { status: 'Completed', open: false },
];
const PAGE = 12;

function Group({ status, list }: { status: Status; list: WorkOrder[] }) {
  const [shown, setShown] = useState(PAGE);
  return (
    <>
      <div className="wo-grid">{list.slice(0, shown).map((w) => <WoCard key={w.id} wo={w} />)}</div>
      {list.length > shown && <button className="btn btn-soft" style={{ marginTop: 16 }} onClick={() => setShown(shown + PAGE)}>Show {Math.min(PAGE, list.length - shown)} more {status.toLowerCase()} work orders</button>}
    </>
  );
}

/** Work orders grouped by status, as accordions. */
export function WoBoard({ list, resetKey }: { list: WorkOrder[]; resetKey?: string }) {
  if (!list.length) return <p className="empty-state">No work orders match these filters.</p>;
  return (
    <div key={resetKey}>
      {GROUPS.map(({ status, open }) => {
        const items = list.filter((w) => w.status === status).sort((a, b) => a.due.localeCompare(b.due));
        return (
          <Accordion key={status} title={`${status} (${items.length})`} open={open && items.length > 0} dim={!items.length}>
            {items.length ? <Group status={status} list={items} /> : <p style={{ color: 'var(--fg-2)', margin: 0 }}>No {status.toLowerCase()} work orders.</p>}
          </Accordion>
        );
      })}
    </div>
  );
}

function useFiltered(state: ReturnType<typeof useWoFilters>, base?: (w: WorkOrder) => boolean) {
  const all = useWorkOrders();
  const assets = useAssets();
  const assetById = useMemo(() => new Map(assets.map((a) => [a.id, a])), [assets]);
  return useMemo(() => filterWorkOrders(base ? all.filter(base) : all, state.f, assetById, (id) => PEOPLE_BY_ID[id]?.name ?? ''), [all, state.f, assetById, base]);
}

export function Assignees() {
  const state = useWoFilters();
  const list = useFiltered(state);
  const nav = useNavigate();
  const rows = byAssignee(list, 30);
  return (
    <main className="page"><PageHead title="Work orders by assignee" back="/analytics" more={<MoreMenu />} />
      <div className="split"><WoFilterRail state={state} locked={['assigneeId']} />
        <section className="card" style={{ padding: '8px 0' }}>
          <Reveal id="assignees"><BarRows rows={rows} onOpen={(r) => nav(`/assignees/${r.key}`)} /><Legend /></Reveal></section></div></main>
  );
}

export function AssigneePage() {
  const { personId = '' } = useParams();
  const person = PEOPLE_BY_ID[personId];
  const state = useWoFilters({ assigneeId: personId });
  const list = useFiltered(state);
  if (!person) return <Navigate to="/assignees" replace />;
  return (
    <main className="page"><PageHead title={`Work orders assigned to ${person.name}`} back="/assignees" more={<MoreMenu />} />
      <div className="split"><WoFilterRail state={state} locked={['assigneeId']} /><div><WoBoard list={list} /></div></div></main>
  );
}

export function MyWork() {
  const user = useCurrentUser();
  return <MyWorkInner key={user.id} />;
}

function MyWorkInner() {
  const user = useCurrentUser();
  const state = useWoFilters({ assigneeId: user.id });
  const base = useMemo(() => (w: WorkOrder) => w.assigneeId === user.id, [user.id]);
  const list = useFiltered(state, base);
  const tech = user.title === 'Technician';
  return (
    <main className="page"><PageHead title={tech ? 'Work orders assigned to me' : `Work orders assigned to ${user.name} (me)`} more={<MoreMenu />} />
      <div className="split"><WoFilterRail state={state} locked={['assigneeId']} /><div><WoBoard list={list} /></div></div></main>
  );
}

export type { WoFilters };
