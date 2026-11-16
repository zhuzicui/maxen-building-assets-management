import { beforeEach, describe, expect, it } from 'vitest';
import { SEED } from '../data/seed';
import { EMPTY_ASSET_FILTERS, EMPTY_WO_FILTERS, filterAssets, filterWorkOrders, openAssetIdsOf } from '../lib/filters';
import { countByStatus, byAssignee } from '../lib/analytics';
import { mergedAssets, mergedWorkOrders, useStore } from './store';

const wo = (id: string) => mergedWorkOrders(useStore.getState()).byId.get(id)!;
const first = (pred: (s: (typeof SEED.workOrders)[number]) => boolean) => SEED.workOrders.find(pred)!;

beforeEach(() => { localStorage.clear(); useStore.getState().resetDemo(); });

describe('store', () => {
  it('status changes are visible everywhere because there is one source', () => {
    const w = first((x) => x.status === 'Ready');
    useStore.getState().setStatus(w.id, 'On hold');
    expect(wo(w.id).status).toBe('On hold');
    expect(mergedWorkOrders(useStore.getState()).list.find((x) => x.id === w.id)?.status).toBe('On hold');
  });

  it('completing a work order completes its checklist', () => {
    const w = first((x) => x.status === 'In progress');
    useStore.getState().setStatus(w.id, 'Completed');
    expect(wo(w.id).groups.every((g) => g.tasks.every((t) => t.done))).toBe(true);
  });

  it('ticking a task on a planned work order starts it', () => {
    const w = first((x) => x.status === 'Planned');
    useStore.getState().toggleTask(w.id, 0, 0, true);
    expect(wo(w.id).status).toBe('In progress');
    expect(wo(w.id).groups[0].tasks[0].done).toBe(true);
  });

  it('creates and assigns work orders', () => {
    const base = first((x) => x.status === 'Ready');
    const id = useStore.getState().createWO({ ...base, name: 'Brand new job', notes: [] });
    expect(wo(id).name).toBe('Brand new job');
    useStore.getState().patchWO(id, { assigneeId: 'p-hudson-alvarez' });
    expect(wo(id).assigneeId).toBe('p-hudson-alvarez');
    expect(mergedWorkOrders(useStore.getState()).list).toHaveLength(SEED.workOrders.length + 1);
  });

  it('creates assets that show up in the merged list', () => {
    const base = SEED.assets[0];
    const id = useStore.getState().createAsset({ ...base, name: 'My boiler' });
    expect(mergedAssets(useStore.getState()).byId.get(id)?.name).toBe('My boiler');
  });

  it('adds and pins notes', () => {
    const w = first((x) => x.notes.length > 1);
    useStore.getState().addNote('wo', w.id, 'Hello');
    const added = wo(w.id).notes.find((n) => n.text === 'Hello')!;
    useStore.getState().pinNote('wo', w.id, added.id);
    expect(wo(w.id).notes[0].text).toBe('Hello');
    expect(wo(w.id).notes.filter((n) => n.pinned)).toHaveLength(1);
  });

  it('saves changes in the browser and restores them', async () => {
    const w = first((x) => x.status === 'Ready');
    useStore.getState().setStatus(w.id, 'Overdue');
    useStore.getState().setBuilding('b-laval');
    const saved = localStorage.getItem('maxen-demo-v1')!;
    expect(saved).toContain('Overdue');
    // Simulate a page reload: wipe the in-memory state, put the saved copy back, rehydrate.
    useStore.setState({ woPatches: {}, buildingId: SEED.buildings[0].id });
    localStorage.setItem('maxen-demo-v1', saved);
    await useStore.persist.rehydrate();
    expect(wo(w.id).status).toBe('Overdue');
    expect(useStore.getState().buildingId).toBe('b-laval');
  });

  it('resets to the original data', () => {
    const w = first((x) => x.status === 'Ready');
    useStore.getState().setStatus(w.id, 'Overdue');
    useStore.getState().resetDemo();
    expect(wo(w.id).status).toBe('Ready');
  });
});

describe('filters and analytics', () => {
  const assetById = new Map(SEED.assets.map((a) => [a.id, a]));
  const name = () => '';
  it('filters work orders', () => {
    const overdue = filterWorkOrders(SEED.workOrders, { ...EMPTY_WO_FILTERS, status: 'Overdue' }, assetById, name);
    expect(overdue.length).toBeGreaterThan(0);
    expect(overdue.every((w) => w.status === 'Overdue')).toBe(true);
    const radio = filterWorkOrders(SEED.workOrders, { ...EMPTY_WO_FILTERS, buildingId: SEED.buildings[0].id, search: 'solar' }, assetById, name);
    expect(radio.length).toBeGreaterThan(0);
    expect(radio.every((w) => w.buildingId === SEED.buildings[0].id)).toBe(true);
    expect(filterWorkOrders(SEED.workOrders, { ...EMPTY_WO_FILTERS, search: 'zzzz-no-match' }, assetById, name)).toHaveLength(0);
  });
  it('filters assets, including by open work order', () => {
    const open = openAssetIdsOf(SEED.workOrders);
    const hits = filterAssets(SEED.assets, { ...EMPTY_ASSET_FILTERS, openWO: true }, open);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThan(SEED.assets.length);
    expect(filterAssets(SEED.assets, { ...EMPTY_ASSET_FILTERS, type: 'Boiler' }, open).every((a) => a.type === 'Boiler')).toBe(true);
  });
  it('counts statuses and ranks assignees from the data', () => {
    expect(countByStatus(SEED.workOrders).reduce((a, b) => a + b, 0)).toBe(SEED.workOrders.length);
    const rows = byAssignee(SEED.workOrders, 10);
    expect(rows).toHaveLength(10);
    expect(rows[0].total).toBeGreaterThanOrEqual(rows[9].total);
  });
});
