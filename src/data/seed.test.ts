import { describe, expect, it } from 'vitest';
import { SEED } from './seed';
import { PEOPLE_BY_ID } from './people';

describe('seed data', () => {
  const assetIds = new Set(SEED.assets.map((a) => a.id));
  const buildingIds = new Set(SEED.buildings.map((b) => b.id));

  it('has unique ids', () => {
    expect(assetIds.size).toBe(SEED.assets.length);
    expect(new Set(SEED.workOrders.map((w) => w.id)).size).toBe(SEED.workOrders.length);
  });

  it('is deterministic apart from dates', async () => {
    const again = (await import('./seed')).buildSeed();
    expect(again.assets.map((a) => a.id + a.name)).toEqual(SEED.assets.map((a) => a.id + a.name));
    expect(again.workOrders.map((w) => w.id + w.name + w.assigneeId)).toEqual(SEED.workOrders.map((w) => w.id + w.name + w.assigneeId));
  });

  it('keeps references valid', () => {
    SEED.workOrders.forEach((w) => {
      expect(buildingIds.has(w.buildingId)).toBe(true);
      expect(PEOPLE_BY_ID[w.assigneeId]).toBeDefined();
      w.assetIds.forEach((id) => expect(assetIds.has(id)).toBe(true));
      expect(w.due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    const byId = new Map(SEED.assets.map((a) => [a.id, a]));
    SEED.assets.forEach((a) => {
      expect(buildingIds.has(a.buildingId)).toBe(true);
      if (a.parentId) expect(byId.get(a.parentId)?.buildingId).toBe(a.buildingId);
      a.contactIds.forEach((id) => expect(PEOPLE_BY_ID[id]).toBeDefined());
    });
  });

  it('gives every building its own layout and the basics', () => {
    const layouts = new Set(SEED.buildings.map((b) => JSON.stringify(b.wings)));
    expect(layouts.size).toBe(SEED.buildings.length);
    SEED.buildings.forEach((b) => {
      const here = SEED.assets.filter((a) => a.buildingId === b.id);
      expect(here.some((a) => a.room === 'Kitchen')).toBe(true);
      expect(here.some((a) => a.floor === 'Rooftop')).toBe(true);
      expect(SEED.workOrders.filter((w) => w.buildingId === b.id).length).toBeGreaterThan(30);
      here.forEach((a) => expect(b.wings.some((w) => w.name === a.wing)).toBe(true));
    });
  });

  it('keeps checklist progress consistent with status', () => {
    SEED.workOrders.forEach((w) => {
      const tasks = w.groups.flatMap((g) => g.tasks);
      if (w.status === 'Completed') expect(tasks.every((t) => t.done)).toBe(true);
      if (w.status === 'Planned' || w.status === 'Ready') expect(tasks.some((t) => t.done)).toBe(false);
    });
  });

  it('has a designed solar page and its work orders in Radio-Canada', () => {
    const solar = SEED.assets.find((a) => a.id === 'a-solar');
    expect(solar?.specs.some((s) => /cfm/.test(s.value))).toBe(false);
    expect(SEED.workOrders.filter((w) => w.assetIds.includes('a-solar')).length).toBeGreaterThanOrEqual(3);
  });
});
