import type { Asset, Status, WorkOrder } from '../types';

export interface WoFilters {
  search: string; buildingId: string; status: string; priority: string; assigneeId: string; supplier: string;
  from: string; to: string; recurrence: string; duration: string; category: string; assetDomain: string;
}
export const EMPTY_WO_FILTERS: WoFilters = { search: '', buildingId: '', status: '', priority: '', assigneeId: '', supplier: '', from: '', to: '', recurrence: '', duration: '', category: '', assetDomain: '' };

export function filterWorkOrders(list: WorkOrder[], f: WoFilters, assetById: Map<string, Asset>, personName: (id: string) => string): WorkOrder[] {
  const q = f.search.trim().toLowerCase();
  return list.filter((w) => {
    if (f.buildingId && w.buildingId !== f.buildingId) return false;
    if (f.status && w.status !== f.status) return false;
    if (f.priority && w.priority !== f.priority) return false;
    if (f.assigneeId && w.assigneeId !== f.assigneeId) return false;
    if (f.supplier && w.supplier !== f.supplier) return false;
    if (f.from && w.due < f.from) return false;
    if (f.to && w.due > f.to) return false;
    if (f.recurrence && w.recurrence !== f.recurrence) return false;
    if (f.duration && w.duration !== f.duration) return false;
    if (f.category && w.category !== f.category) return false;
    if (f.assetDomain && !w.assetIds.some((id) => assetById.get(id)?.domain === f.assetDomain)) return false;
    if (q) {
      const hay = [w.name, w.description, w.category, w.type, personName(w.assigneeId), ...w.assetIds.map((id) => assetById.get(id)?.name ?? '')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export interface AssetFilters { search: string; openWO: boolean; brand: string; model: string; year: string; domain: string; type: string }
export const EMPTY_ASSET_FILTERS: AssetFilters = { search: '', openWO: false, brand: '', model: '', year: '', domain: '', type: '' };

export function filterAssets(list: Asset[], f: AssetFilters, openAssetIds: Set<string>): Asset[] {
  const q = f.search.trim().toLowerCase();
  return list.filter((a) => {
    if (f.openWO && !openAssetIds.has(a.id)) return false;
    if (f.brand && a.brand !== f.brand) return false;
    if (f.model && a.model !== f.model) return false;
    if (f.year && String(a.year) !== f.year) return false;
    if (f.domain && a.domain !== f.domain) return false;
    if (f.type && a.type !== f.type) return false;
    if (q && !`${a.name} ${a.brand} ${a.model} ${a.type} ${a.domain}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export const isOpen = (s: Status) => s !== 'Completed';
export const openAssetIdsOf = (wos: WorkOrder[]): Set<string> => {
  const out = new Set<string>();
  wos.forEach((w) => { if (isOpen(w.status)) w.assetIds.forEach((id) => out.add(id)); });
  return out;
};

export const uniq = <T,>(list: T[], sort?: (a: T, b: T) => number): T[] => [...new Set(list)].sort(sort ?? ((a, b) => String(a).localeCompare(String(b), 'fr')));
