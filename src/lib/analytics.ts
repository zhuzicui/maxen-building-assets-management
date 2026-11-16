import { MONTH_SHORT, addDays, parse, todayIso } from './dates';
import { durationHours } from './duration';
import type { Priority, Status, WorkOrder } from '../types';
import { PRIORITIES, STATUSES } from '../types';
import { PEOPLE_BY_ID } from '../data/people';

export const countByStatus = (wos: WorkOrder[]): number[] => STATUSES.map((s) => wos.filter((w) => w.status === s).length);

const BAR_STATUSES: Status[] = ['In progress', 'On hold', 'Overdue', 'Completed'];
export interface BarRow { key: string; name: string; sub?: string; counts: number[]; total: number }

const toRows = (groups: Map<string, WorkOrder[]>, label: (k: string) => { name: string; sub?: string }, n: number): BarRow[] =>
  [...groups.entries()]
    .map(([key, list]) => { const counts = BAR_STATUSES.map((s) => list.filter((w) => w.status === s).length); return { key, ...label(key), counts, total: counts.reduce((a, b) => a + b, 0) }; })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, n);

const group = (wos: WorkOrder[], key: (w: WorkOrder) => string) => {
  const m = new Map<string, WorkOrder[]>();
  wos.forEach((w) => m.set(key(w), [...(m.get(key(w)) ?? []), w]));
  return m;
};
export const byAssignee = (wos: WorkOrder[], n = 10): BarRow[] =>
  toRows(group(wos, (w) => w.assigneeId), (id) => ({ name: PEOPLE_BY_ID[id]?.name ?? id, sub: PEOPLE_BY_ID[id]?.company }), n);
export const byCategory = (wos: WorkOrder[], n = 10): BarRow[] => toRows(group(wos, (w) => w.category), (k) => ({ name: k }), n);

export const priorityShare = (wos: WorkOrder[]): { priority: Priority; pct: number; n: number }[] =>
  PRIORITIES.map((p) => { const n = wos.filter((w) => w.priority === p).length; return { priority: p, n, pct: wos.length ? Math.round((n / wos.length) * 100) : 0 }; });

/** The last 12 months ending with the current one. */
export const lastMonths = (count = 12) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1); return { y: d.getFullYear(), m: d.getMonth(), label: MONTH_SHORT[d.getMonth()] }; });
};

export const completionByMonth = (wos: WorkOrder[]) =>
  lastMonths().map(({ y, m, label }) => {
    const inMonth = wos.filter((w) => { const d = parse(w.due); return d.getFullYear() === y && d.getMonth() === m; });
    const done = inMonth.filter((w) => w.status === 'Completed').length;
    const pct = inMonth.length ? Math.round((done / inMonth.length) * 100) : 0;
    return { label, completed: pct, other: inMonth.length ? 100 - pct : 0, n: inMonth.length };
  });

/** Completed work orders: hours over (+) or under (-) the estimate, placed by due date across the last 12 months. */
export const durationVariance = (wos: WorkOrder[]) => {
  const months = lastMonths();
  return wos.filter((w) => w.status === 'Completed' && w.actualHours != null).flatMap((w) => {
    const d = parse(w.due);
    const idx = months.findIndex((mo) => mo.y === d.getFullYear() && mo.m === d.getMonth());
    if (idx < 0) return [];
    const x = idx + (d.getDate() - 1) / new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return [{ id: w.id, x, v: (w.actualHours as number) - durationHours(w.duration) }];
  });
};

/** Share of work orders due in a 90-day window that are not overdue. */
export const maintenanceScore = (wos: WorkOrder[], endOffsetDays = 0): number => {
  const end = addDays(todayIso(), -endOffsetDays), start = addDays(end, -90);
  const inWindow = wos.filter((w) => w.due >= start && w.due <= end);
  if (!inWindow.length) return 0;
  return Math.round((inWindow.filter((w) => w.status !== 'Overdue').length / inWindow.length) * 100);
};
