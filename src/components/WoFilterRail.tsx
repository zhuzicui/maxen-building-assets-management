import { useMemo, useState } from 'react';
import { FilterRail, type FilterField } from './FilterRail';
import { EMPTY_WO_FILTERS, uniq, type WoFilters } from '../lib/filters';
import { PRIORITIES, STATUSES } from '../types';
import { EXTERNAL, HUDSON, INTERNAL, SUPPLIERS } from '../data/people';
import { SEED } from '../data/seed';
import { DURATIONS } from '../lib/duration';
import { useAssets, useWorkOrders } from '../store/store';

export function useWoFilters(initial: Partial<WoFilters> = {}) {
  const [f, setF] = useState<WoFilters>({ ...EMPTY_WO_FILTERS, ...initial });
  const set = <K extends keyof WoFilters>(k: K) => (v: WoFilters[K]) => setF((cur) => ({ ...cur, [k]: v }));
  const reset = () => setF({ ...EMPTY_WO_FILTERS, ...initial });
  const active = (Object.keys(f) as (keyof WoFilters)[]).filter((k) => f[k] && f[k] !== (initial[k] ?? '')).length;
  return { f, set, reset, active };
}

/** The shared work order filter panel. `locked` hides filters that are fixed by the screen (a building, an assignee). */
export function WoFilterRail({ state, locked = [] }: { state: ReturnType<typeof useWoFilters>; locked?: (keyof WoFilters)[] }) {
  const { f, set, reset, active } = state;
  const wos = useWorkOrders();
  const assets = useAssets();
  const opts = useMemo(() => ({
    categories: uniq(wos.map((w) => w.category)), recurrences: uniq(wos.map((w) => w.recurrence)), domains: uniq(assets.map((a) => a.domain)),
  }), [wos, assets]);
  const people = [HUDSON, ...INTERNAL, ...EXTERNAL].filter((p) => wos.some((w) => w.assigneeId === p.id)).map((p) => ({ value: p.id, label: p.name }));
  const show = (k: keyof WoFilters) => !locked.includes(k);
  const fields: FilterField[] = [
    { t: 'search', value: f.search, set: set('search') },
    { t: 'head', text: 'General' },
    ...(show('buildingId') ? [{ t: 'select', label: 'Building', value: f.buildingId, set: set('buildingId'), options: SEED.buildings.map((b) => ({ value: b.id, label: b.name })) } as FilterField] : []),
    { t: 'select', label: 'Status', value: f.status, set: set('status'), options: STATUSES },
    { t: 'select', label: 'Priority', value: f.priority, set: set('priority'), options: PRIORITIES },
    ...(show('assigneeId') ? [{ t: 'select', label: 'Assignee', value: f.assigneeId, set: set('assigneeId'), options: people } as FilterField] : []),
    { t: 'select', label: 'Supplier (company)', value: f.supplier, set: set('supplier'), options: ['Maxen', ...SUPPLIERS.map((s) => s.name)] },
    { t: 'head', text: 'Time' },
    { t: 'dates', from: f.from, to: f.to, setFrom: set('from'), setTo: set('to') },
    { t: 'select', label: 'Recurrence', value: f.recurrence, set: set('recurrence'), options: opts.recurrences },
    { t: 'select', label: 'Work order duration', value: f.duration, set: set('duration'), options: DURATIONS },
    { t: 'head', text: 'Category' },
    { t: 'select', label: 'Maintenance category', value: f.category, set: set('category'), options: opts.categories },
    { t: 'select', label: 'Asset category', value: f.assetDomain, set: set('assetDomain'), options: opts.domains },
  ];
  return <FilterRail fields={fields} activeCount={active} onReset={reset} />;
}
