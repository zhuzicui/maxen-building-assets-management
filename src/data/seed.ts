import { BUILDINGS, floorLabels } from './buildings';
import { ASSET_CATALOG, DOMAIN_SUPPLIER, SOLAR_SPECS, specsFor, type CatalogEntry } from './catalog';
import { CRISTOPHER, EXTERNAL, HUDSON, INTERNAL, isCrew, peopleAt } from './people';
import { FRENCH_TITLES, WO_SPECS, type WoSpec } from './woSpecs';
import { addDays, todayIso } from '../lib/dates';
import { durationHours } from '../lib/duration';
import { hashStr, int, pick, rng, shuffle, type Rng } from '../lib/rng';
import type { Asset, Building, ChecklistGroup, Doc, Note, Status, WorkOrder } from '../types';

const MEETING_NAMES = ['Mount Royal', 'Mount Fuji', 'Saint-Laurent', 'Rideau', 'Outaouais', 'Mont-Tremblant', 'Champlain', 'Jacques-Cartier'];
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const roomsFor = (building: Building, wingIdx: number, floor: string): string[] => {
  if (floor === 'Rooftop') return ['Rooftop'];
  const n = parseInt(floor.replace(/\D/g, ''), 10);
  const r = rng(`rooms|${building.id}|${wingIdx}|${floor}`);
  const meeting = `Meeting room ${pick(r, MEETING_NAMES)}`;
  if (n === 1) return [...(wingIdx === 0 ? ['Kitchen'] : []), 'Lobby', 'Mechanical room', meeting, `Room 1.1`];
  return [meeting, 'Open office', `Room ${n}.1`, `Room ${n}.2`, ...(n % 4 === 0 ? ['Mechanical room'] : [])];
};

const tagOf = (room: string): string => (room === 'Rooftop' ? 'r' : /kitchen/i.test(room) ? 'k' : /meeting/i.test(room) ? 'm' : /mechanical/i.test(room) ? 'x' : 'g');

/* ---------- assets ---------- */
function generateAssets(): Asset[] {
  const out: Asset[] = [];
  BUILDINGS.forEach((b, bi) => {
    const counters: Record<string, number> = {};
    b.wings.forEach((w, wi) => {
      const wl = wi === 0 ? '' : String.fromCharCode(65 + wi);
      floorLabels(w).forEach((floor) => {
        const fl = floor === 'Rooftop' ? 'R' : floor.replace(/\D/g, '');
        roomsFor(b, wi, floor).forEach((room) => {
          const r = rng(`assets|${b.id}|${wi}|${floor}|${room}`);
          const tag = tagOf(room);
          const pool = ASSET_CATALOG.filter((c) => c[6].includes(tag) || (tag !== 'r' && tag !== 'x' && c[6].includes('g') && r() < 0.5));
          // The first wing's kitchen, mechanical room and rooftop hold one of everything that belongs there, so every building has the basics.
          const must = wi === 0 && (tag === 'k' || tag === 'r' || (tag === 'x' && floor === 'Floor 1')) ? pool.filter((c) => c[6].includes(tag)) : [];
          const extra = tag === 'k' ? int(r, 20, 40) : tag === 'r' ? int(r, 12, 22) : tag === 'x' ? int(r, 8, 14) : int(r, 4, 10);
          const entries: CatalogEntry[] = [...must, ...Array.from({ length: extra }, () => pick(r, pool))];
          const inRoom: Asset[] = [];
          entries.forEach(([domain, type, en, fr, pre, brands]) => {
            const ck = `${wi}|${floor}|${pre}`;
            counters[ck] = (counters[ck] ?? 0) + 1;
            const brand = pick(r, brands);
            const year = 2012 + int(r, 0, 11);
            const hasWarranty = r() < 0.6;
            const a: Asset = {
              id: `a${bi}-${out.length}`, buildingId: b.id, wing: w.name, floor, room,
              name: `${r() < 0.4 ? fr : en} ${pre}-${wl}${fl}${String(counters[ck]).padStart(2, '0')}`,
              domain, type, brand,
              model: `${brand.replace(/[^A-Z]/g, '').slice(0, 3) || brand.slice(0, 3).toUpperCase()}-${100 + Math.floor(r() * 900)}${pick(r, ['', 'A', 'B', 'X', 'LT', 'HD'])}`,
              year, specs: specsFor(domain, r), notes: [], contactIds: [],
              docs: [{ name: 'Installation manual.pdf', kind: 'Manual' }, ...(hasWarranty ? [{ name: 'Warranty certificate.pdf', kind: 'Warranty' } as Doc] : []), ...(r() < 0.4 ? [{ name: 'Wiring diagram.pdf', kind: 'Drawing' } as Doc] : [])],
              ...(hasWarranty ? { warranty: { provider: brand, start: `${year}-06-01`, end: `${year + pick(r, [3, 5, 5, 10])}-06-01` } } : {}),
            };
            const sup = peopleAt(DOMAIN_SUPPLIER[domain] ?? 'Entretien Lumina');
            a.contactIds = shuffle(r, sup.filter(isCrew)).slice(0, 2).map((p) => p.id);
            const sameDomain = inRoom.filter((o) => o.domain === domain && !o.parentId);
            if (sameDomain.length && r() < 0.18) a.parentId = pick(r, sameDomain).id;
            inRoom.push(a);
            out.push(a);
          });
        });
      });
    });
  });
  return out;
}

/** The one asset with a designed detail page in the original: rooftop solar panels on the Studios wing of Radio-Canada. */
function addSolar(assets: Asset[]): Asset {
  const r = rng('solar');
  const today = todayIso();
  const solar: Asset = {
    id: 'a-solar', buildingId: BUILDINGS[0].id, wing: 'Studios', floor: 'Rooftop', room: 'Rooftop', name: 'Panneaux solaires', domain: 'Electrical', type: 'Solar panel',
    brand: 'Bousquet Technologies', model: 'HDGH-65-SS-O-4-HTM-WO', year: 2020, description: 'Les panneaux solaires du toit des Studios, raccordés à l’onduleur solaire INV-R01.',
    specs: SOLAR_SPECS, warranty: { provider: 'Bousquet Technologies', start: '2020-11-01', end: '2030-11-01' },
    docs: [{ name: 'Installation manual.pdf', kind: 'Manual' }, { name: 'Warranty certificate.pdf', kind: 'Warranty' }, { name: 'Wiring diagram.pdf', kind: 'Drawing' }, { name: 'Inspection report 2022.pdf', kind: 'Report' }, { name: 'Supplier invoice.pdf', kind: 'Invoice' }],
    contactIds: [peopleAt('Shepard')[0].id, peopleAt('Toitures Mont-Royal')[0].id],
    notes: [
      { id: 'sn1', pinned: true, text: 'Le panneau 14 a une fissure dans le coin inférieur, à surveiller au prochain nettoyage.', who: EXTERNAL[2].name, when: `${addDays(today, -84)}T15:10:00` },
      { id: 'sn2', text: 'Production last month was 6% below forecast. Probably dirt, cleaning is booked.', who: INTERNAL[0].name, when: `${addDays(today, -52)}T10:30:00`, imgs: 2 },
      { id: 'sn3', text: 'Accès au toit par l’escalier C seulement, l’échelle du 11e est condamnée.', who: INTERNAL[3].name, when: `${addDays(today, -52)}T11:05:00` },
      { id: 'sn4', text: 'Warranty runs until 2030, keep Bousquet Technologies in copy for any repair.', who: EXTERNAL[7].name, when: `${addDays(today, -52)}T11:40:00` },
    ],
    solar: true,
  };
  void r;
  // The Studios rooftop inverter becomes a sub-asset of the panels.
  const inv = assets.find((a) => a.buildingId === solar.buildingId && a.wing === 'Studios' && a.floor === 'Rooftop' && a.type === 'Solar inverter');
  if (inv) inv.parentId = solar.id;
  assets.push(solar);
  return solar;
}

/* ---------- work orders ---------- */
const NOTES_EN = ['Access is through the service corridor. Ask security for the key at the desk.', 'Parts are on site, in the mechanical room cage.', 'Please send photos before and after, the property manager wants them for the report.', 'Last visit found nothing abnormal. Same procedure as last year.', '{asset}: minor wear noticed last time, check it again.', 'Quote for the follow-up repairs sent to the property manager.', 'Work needs a lock-out; the electrician will be on site at 8 am.'];
const NOTES_FR = ['L’accès se fait par le corridor de service. Demander la clé à la sécurité.', 'Les pièces sont sur place, dans la cage de la salle mécanique.', 'Merci d’envoyer des photos avant et après pour le rapport.', 'Rien d’anormal à la dernière visite. Même procédure que l’an passé.', '{asset} : légère usure notée la dernière fois, à revérifier.', 'Soumission pour les réparations envoyée au gestionnaire immobilier.'];

const dueFor = (status: Status, r: Rng, today: string): string => {
  switch (status) {
    case 'Planned': return addDays(today, int(r, 10, 60));
    case 'Ready': return addDays(today, int(r, 2, 21));
    case 'In progress': return addDays(today, int(r, -2, 12));
    case 'On hold': return addDays(today, int(r, -10, 20));
    case 'Overdue': return addDays(today, -int(r, 3, 25));
    case 'Completed': return addDays(today, -int(r, 2, 330));
  }
};

export const checklistFor = (spec: WoSpec, assets: Asset[], status: Status, r: Rng): ChecklistGroup[] => {
  const fr = FRENCH_TITLES.has(spec.title);
  const tasks = (list: string[]) => list.map((text, i) => {
    const unit = text.match(/\[([^\]]+)\]$/)?.[1];
    return { id: `t${i}`, text: text.replace(/\s*\[[^\]]+\]$/, ''), unit, done: false };
  });
  const groups: ChecklistGroup[] = assets.length
    ? assets.map((a, i) => ({ id: `g${i}`, title: a.name, assetId: a.id, tasks: tasks(i === 0 ? spec.tasks : spec.tasks.slice(0, Math.max(2, spec.tasks.length - 2))) }))
    : [{ id: 'g0', title: fr ? 'Tâches' : 'Tasks', tasks: tasks(spec.tasks) }];
  groups.push({ id: `g${groups.length}`, title: fr ? 'Autres tâches' : 'Other tasks', tasks: tasks(fr ? ['Mettre à jour le registre', 'Nettoyer la zone de travail'] : ['Update the logbook', 'Clean up the work area']) });
  const last = groups.length - 1;
  groups.forEach((g, gi) => g.tasks.forEach((t, ti) => {
    t.done = status === 'Completed' ? true : status === 'Planned' || status === 'Ready' ? false : gi === last ? false : ti === 0 || r() < 0.4;
  }));
  return groups;
};

function generateWorkOrders(assets: Asset[]): WorkOrder[] {
  const today = todayIso();
  const out: WorkOrder[] = [];
  const byBuilding = new Map<string, Asset[]>();
  assets.forEach((a) => byBuilding.set(a.buildingId, [...(byBuilding.get(a.buildingId) ?? []), a]));
  BUILDINGS.forEach((b, bi) => {
    const pool = byBuilding.get(b.id) ?? [];
    const r = rng('wo|' + b.id);
    const hasType = (t: string) => pool.some((a) => a.type === t);
    const eligible = WO_SPECS.filter((s) => (!s.only || s.only === b.short) && s.assetTypes.every(hasType));
    const forced = eligible.filter((s) => s.only);
    const rest = shuffle(r, eligible.filter((s) => !s.only));
    const chosen = [...forced, ...rest].slice(0, 36);
    const pool0: Status[] = [...Array(7).fill('Ready'), ...Array(7).fill('In progress'), ...Array(6).fill('Planned'), ...Array(3).fill('On hold'), ...Array(4).fill('Overdue'), ...Array(9).fill('Completed')];
    const statuses = shuffle(r, pool0) as Status[];
    const FORCED: Record<string, Status> = { 'Toit des Studios': 'In progress', 'Sweep snow': 'Completed', 'Adjust inclination': 'Completed', 'Clean solar panels': 'Ready' };

    const make = (spec: WoSpec, status: Status, n: number, history: boolean, dueOverride?: string) => {
      const wr = rng(`wo|${b.id}|${spec.title}|${n}`);
      const fr = FRENCH_TITLES.has(spec.title);
      // Pick real assets of the right type from this building.
      const used: Asset[] = [];
      spec.assetTypes.forEach((t, ti) => {
        const of = pool.filter((a) => a.type === t);
        if (!of.length) return;
        const solar = of.find((a) => a.solar);
        if (solar && b.id === BUILDINGS[0].id) { used.push(solar); return; }
        const first = ti === 0 ? 2 : 1;
        shuffle(wr, of).slice(0, first).forEach((a) => used.push(a));
      });
      if (spec.title === 'Toit des Studios') {
        const inv = pool.find((a) => a.type === 'Solar inverter' && a.wing === 'Studios');
        if (inv && !used.includes(inv)) used.push(inv);
      }
      const crew = peopleAt(spec.supplier).filter(isCrew);
      let who = spec.title === 'Toit des Studios' ? CRISTOPHER : crew.length ? pick(wr, crew) : pick(wr, peopleAt(spec.supplier));
      if (!history && n % 9 === 4 && spec.title !== 'Toit des Studios') who = HUDSON;
      const due = dueOverride ?? dueFor(status, wr, today);
      const noteTexts = shuffle(wr, fr ? NOTES_FR : NOTES_EN).slice(0, 2 + Math.floor(wr() * 3));
      const authors = [who, HUDSON, ...shuffle(wr, INTERNAL.slice(0, 3))];
      const notes: Note[] = history ? [] : noteTexts.map((text, i) => ({
        id: `n${i}`, text: text.replace('{asset}', used[0]?.name ?? spec.title), who: authors[i % authors.length].name,
        when: `${addDays(due > today ? today : due, -(3 + i * 4 + Math.floor(wr() * 3)))}T${pick(wr, ['09', '11', '14', '16'])}:20:00`, pinned: i === 0, imgs: i === 1 && wr() < 0.6 ? 2 : 0,
      }));
      const wo: WorkOrder = {
        id: `wo-${bi}-${out.length}`, buildingId: b.id, name: spec.title, description: spec.description, category: spec.category, type: spec.type,
        recurrence: spec.recurrence, duration: spec.duration, priority: spec.priority, status, due, assigneeId: who.id, supplier: who.company,
        assetIds: used.map((a) => a.id), groups: checklistFor(spec, used, status, wr), notes, french: fr,
        ...(status === 'Completed' ? { actualHours: Math.max(0.5, Math.round(durationHours(spec.duration) * (0.55 + wr() * 0.95) * 2) / 2) } : {}),
      };
      out.push(wo);
    };
    chosen.forEach((spec, i) => make(spec, FORCED[spec.title] ?? statuses[i % statuses.length], i, false));
    // History: earlier completed runs of the recurring work orders, so analytics have a year behind them.
    const rr = rng('history|' + b.id);
    const recurring = chosen.filter((s) => s.recurrence !== 'One time');
    for (let i = 0; i < 28 && recurring.length; i++) {
      // A few old ones were never closed out, so past months do not all read 100%.
      const x = rr();
      const status: Status = x < 0.84 ? 'Completed' : x < 0.93 ? 'On hold' : 'Overdue';
      make(pick(rr, recurring), status, 100 + i, true, addDays(today, -(40 + Math.floor(rr() * 290))));
    }
  });
  return out;
}

export interface Seed { buildings: Building[]; assets: Asset[]; workOrders: WorkOrder[] }

export const buildSeed = (): Seed => {
  const assets = generateAssets();
  addSolar(assets);
  const workOrders = generateWorkOrders(assets);
  return { buildings: BUILDINGS, assets, workOrders };
};

export const SEED = buildSeed();
export const SEED_ASSETS = new Map(SEED.assets.map((a) => [a.id, a]));
export const SEED_WOS = new Map(SEED.workOrders.map((w) => [w.id, w]));
export { hashStr, slug };
