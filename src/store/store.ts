import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SEED, SEED_ASSETS, SEED_WOS } from '../data/seed';
import { HUDSON, CRISTOPHER, PEOPLE_BY_ID } from '../data/people';
import type { Asset, ChecklistGroup, Note, Status, WorkOrder } from '../types';

/**
 * The demo has no backend. The generated base data (seed) is rebuilt from code on every load, and
 * everything the user changes is kept as a small overlay in localStorage. Selectors merge the two,
 * so every screen reads the same work orders and assets.
 */
export type Role = 'manager' | 'technician';
export const USER_FOR_ROLE: Record<Role, string> = { manager: HUDSON.id, technician: CRISTOPHER.id };

export interface Overlay {
  woPatches: Record<string, Partial<WorkOrder>>;
  newWOs: WorkOrder[];
  assetPatches: Record<string, Partial<Asset>>;
  newAssets: Asset[];
}

export interface State extends Overlay {
  buildingId: string;
  role: Role;
  theme: 'light' | 'dark' | null;
  prefs: boolean[];

  setBuilding: (id: string) => void;
  setRole: (r: Role) => void;
  setTheme: (t: 'light' | 'dark' | null) => void;
  setPref: (i: number, v: boolean) => void;
  patchWO: (id: string, patch: Partial<WorkOrder>) => void;
  setStatus: (id: string, status: Status) => void;
  toggleTask: (woId: string, gi: number, ti: number, done: boolean) => void;
  saveGroup: (woId: string, gi: number, tasks: ChecklistGroup['tasks']) => void;
  addNote: (kind: 'wo' | 'asset', id: string, text: string) => void;
  pinNote: (kind: 'wo' | 'asset', id: string, noteId: string) => void;
  createWO: (wo: Omit<WorkOrder, 'id' | 'created'>) => string;
  createAsset: (a: Omit<Asset, 'id' | 'created'>) => string;
  resetDemo: () => void;
}

const empty: Overlay = { woPatches: {}, newWOs: [], assetPatches: {}, newAssets: [] };
let counter = 0;
export const newId = (prefix: string) => `${prefix}-new-${Date.now().toString(36)}${(counter++).toString(36)}`;

/* ---------- merge selectors (memoised on the overlay objects) ---------- */
const woCache: { patches?: unknown; added?: unknown; list: WorkOrder[]; byId: Map<string, WorkOrder> } = { list: [], byId: new Map() };
export function mergedWorkOrders(s: Pick<Overlay, 'woPatches' | 'newWOs'>) {
  if (woCache.patches === s.woPatches && woCache.added === s.newWOs) return woCache;
  const list = [...SEED.workOrders, ...s.newWOs].map((w) => (s.woPatches[w.id] ? { ...w, ...s.woPatches[w.id] } : w));
  woCache.patches = s.woPatches; woCache.added = s.newWOs; woCache.list = list; woCache.byId = new Map(list.map((w) => [w.id, w]));
  return woCache;
}
const assetCache: { patches?: unknown; added?: unknown; list: Asset[]; byId: Map<string, Asset> } = { list: [], byId: new Map() };
export function mergedAssets(s: Pick<Overlay, 'assetPatches' | 'newAssets'>) {
  if (assetCache.patches === s.assetPatches && assetCache.added === s.newAssets) return assetCache;
  const list = [...SEED.assets, ...s.newAssets].map((a) => (s.assetPatches[a.id] ? { ...a, ...s.assetPatches[a.id] } : a));
  assetCache.patches = s.assetPatches; assetCache.added = s.newAssets; assetCache.list = list; assetCache.byId = new Map(list.map((a) => [a.id, a]));
  return assetCache;
}

/** Current state of one work order, base data plus the user's changes. */
const currentWO = (s: Overlay, id: string): WorkOrder | undefined => mergedWorkOrders(s).byId.get(id);
const currentAsset = (s: Overlay, id: string): Asset | undefined => mergedAssets(s).byId.get(id);

const noteAuthor = () => HUDSON.name;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...empty,
      buildingId: SEED.buildings[0].id,
      role: 'manager',
      theme: null,
      prefs: [true, true, true, false, false],

      setBuilding: (buildingId) => set({ buildingId }),
      setRole: (role) => set({ role }),
      setTheme: (theme) => set({ theme }),
      setPref: (i, v) => set((s) => ({ prefs: s.prefs.map((p, j) => (j === i ? v : p)) })),

      patchWO: (id, patch) => set((s) => {
        if (s.newWOs.some((w) => w.id === id)) return { newWOs: s.newWOs.map((w) => (w.id === id ? { ...w, ...patch } : w)) };
        return { woPatches: { ...s.woPatches, [id]: { ...s.woPatches[id], ...patch } } };
      }),

      setStatus: (id, status) => {
        const wo = currentWO(get(), id);
        if (!wo) return;
        const patch: Partial<WorkOrder> = { status };
        // Completing a work order completes its checklist; the reverse is never forced.
        if (status === 'Completed') patch.groups = wo.groups.map((g) => ({ ...g, tasks: g.tasks.map((t) => ({ ...t, done: true })) }));
        get().patchWO(id, patch);
      },

      toggleTask: (woId, gi, ti, done) => {
        const wo = currentWO(get(), woId);
        if (!wo) return;
        const groups = wo.groups.map((g, i) => (i !== gi ? g : { ...g, tasks: g.tasks.map((t, j) => (j === ti ? { ...t, done } : t)) }));
        const patch: Partial<WorkOrder> = { groups };
        // Starting work moves a planned work order to "In progress".
        if (done && (wo.status === 'Planned' || wo.status === 'Ready')) patch.status = 'In progress';
        get().patchWO(woId, patch);
      },

      saveGroup: (woId, gi, tasks) => {
        const wo = currentWO(get(), woId);
        if (!wo) return;
        const patch: Partial<WorkOrder> = { groups: wo.groups.map((g, i) => (i === gi ? { ...g, tasks } : g)) };
        if (tasks.some((t) => t.done) && (wo.status === 'Planned' || wo.status === 'Ready')) patch.status = 'In progress';
        get().patchWO(woId, patch);
      },

      addNote: (kind, id, text) => {
        const note: Note = { id: newId('n'), text, who: noteAuthor(), when: new Date().toISOString() };
        if (kind === 'wo') {
          const wo = currentWO(get(), id);
          if (!wo) return;
          const pinned = wo.notes.filter((n) => n.pinned).length;
          const notes = [...wo.notes]; notes.splice(pinned, 0, note);
          get().patchWO(id, { notes });
        } else {
          const a = currentAsset(get(), id);
          if (!a) return;
          const pinned = a.notes.filter((n) => n.pinned).length;
          const notes = [...a.notes]; notes.splice(pinned, 0, note);
          set((s) => patchAsset(s, id, { notes }));
        }
      },

      pinNote: (kind, id, noteId) => {
        const reorder = (list: Note[]) => {
          const n = list.find((x) => x.id === noteId);
          if (!n) return list;
          return [{ ...n, pinned: true }, ...list.filter((x) => x.id !== noteId).map((x) => ({ ...x, pinned: false }))];
        };
        if (kind === 'wo') { const wo = currentWO(get(), id); if (wo) get().patchWO(id, { notes: reorder(wo.notes) }); }
        else { const a = currentAsset(get(), id); if (a) set((s) => patchAsset(s, id, { notes: reorder(a.notes) })); }
      },

      createWO: (draft) => {
        const id = newId('wo');
        set((s) => ({ newWOs: [{ ...draft, id, created: true }, ...s.newWOs] }));
        return id;
      },
      createAsset: (draft) => {
        const id = newId('a');
        set((s) => ({ newAssets: [{ ...draft, id, created: true }, ...s.newAssets] }));
        return id;
      },
      resetDemo: () => set({ ...empty, buildingId: SEED.buildings[0].id, role: 'manager' }),
    }),
    {
      name: 'maxen-demo-v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ woPatches: s.woPatches, newWOs: s.newWOs, assetPatches: s.assetPatches, newAssets: s.newAssets, buildingId: s.buildingId, role: s.role, theme: s.theme, prefs: s.prefs }),
    },
  ),
);

function patchAsset(s: State, id: string, patch: Partial<Asset>): Partial<State> {
  if (s.newAssets.some((a) => a.id === id)) return { newAssets: s.newAssets.map((a) => (a.id === id ? { ...a, ...patch } : a)) };
  return { assetPatches: { ...s.assetPatches, [id]: { ...s.assetPatches[id], ...patch } } };
}

/* ---------- hooks ---------- */
export const useWorkOrders = () => {
  const woPatches = useStore((s) => s.woPatches);
  const newWOs = useStore((s) => s.newWOs);
  return mergedWorkOrders({ woPatches, newWOs }).list;
};
export const useAssets = () => {
  const assetPatches = useStore((s) => s.assetPatches);
  const newAssets = useStore((s) => s.newAssets);
  return mergedAssets({ assetPatches, newAssets }).list;
};
export const useWorkOrder = (id: string | undefined) => {
  const woPatches = useStore((s) => s.woPatches);
  const newWOs = useStore((s) => s.newWOs);
  return id ? mergedWorkOrders({ woPatches, newWOs }).byId.get(id) : undefined;
};
export const useAsset = (id: string | undefined) => {
  const assetPatches = useStore((s) => s.assetPatches);
  const newAssets = useStore((s) => s.newAssets);
  return id ? mergedAssets({ assetPatches, newAssets }).byId.get(id) : undefined;
};
export const useBuilding = () => {
  const id = useStore((s) => s.buildingId);
  return SEED.buildings.find((b) => b.id === id) ?? SEED.buildings[0];
};
export const useCurrentUser = () => {
  const role = useStore((s) => s.role);
  return PEOPLE_BY_ID[USER_FOR_ROLE[role]];
};
export { SEED, SEED_ASSETS, SEED_WOS };
