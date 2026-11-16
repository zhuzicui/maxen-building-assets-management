import { pick, rng, shuffle } from '../lib/rng';
import type { Person } from '../types';

const FIRST_NAMES = ['Marie-Ève','Jean-François','Sophie','Mathieu','Camille','Olivier','Isabelle','Étienne','Nadia','Gabriel','Chloé','Alexandre','Émilie','Samuel','Valérie','Karim','Priya','Daniel','Laura','Kevin','Amélie','Thomas','Fatima','Simon','Julie','Marc-André','Sarah','Vincent','Mélanie','Lucas','Andréanne','Patrick','Yasmine','Louis','Geneviève','Ryan','Nathalie','Hugo','Catherine','Maxime'];
const LAST_NAMES = ['Tremblay','Gagnon','Roy','Côté','Bouchard','Gauthier','Morin','Lavoie','Fortin','Gagné','Ouellet','Pelletier','Bélanger','Lévesque','Bergeron','Leblanc','Paquette','Girard','Nguyen','Haddad','Patel','Chen','Murphy','Campbell','Fraser','Martel','Dubois','Lefebvre','Benoît','Caron','Desjardins','Thibault','Okafor','Rossi','Sauvé'];

/** Suppliers are fictional. Shepard comes from the original design file. */
export const SUPPLIERS = [
  { name: 'Shepard', domain: 'shepard.com', disc: 'Electricity' },
  { name: 'Mécanique Laurentide', domain: 'mlaurentide.ca', disc: 'HVAC' },
  { name: 'Plomberie Saint-Laurent', domain: 'plomberiestl.ca', disc: 'Plumbing' },
  { name: 'Réfrigération Boréal', domain: 'refboreal.ca', disc: 'Refrigeration' },
  { name: 'Ascenseurs Montcalm', domain: 'ascmontcalm.ca', disc: 'Elevators' },
  { name: 'Vigil Sécurité Incendie', domain: 'vigilsecurite.ca', disc: 'Fire safety' },
  { name: 'Northline Controls', domain: 'northline.ca', disc: 'Building automation' },
  { name: 'Toitures Mont-Royal', domain: 'toituresmr.ca', disc: 'Roofing' },
  { name: 'Entretien Lumina', domain: 'lumina.ca', disc: 'Janitorial' },
] as const;

const EXT_TITLES = ['Technician', 'Technician', 'Technician', 'Senior technician', 'Foreman', 'Service coordinator', 'Account manager'];
const INT_TITLES = ['ESG Director', 'Property manager', 'Portfolio manager', 'Maintenance planner', 'Facilities coordinator', 'Energy analyst'];
const INT_DISC: Record<string, string> = { 'ESG Director': 'Sustainability', 'Property manager': 'Property management', 'Portfolio manager': 'Asset management', 'Maintenance planner': 'Maintenance', 'Facilities coordinator': 'Facilities', 'Energy analyst': 'Energy' };

const initials = (name: string) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const phoneFor = (k: string) => {
  const r = rng('phone|' + k);
  return `(${pick(r, ['514', '438'])}) 555-01${String(Math.floor(r() * 100)).padStart(2, '0')}`;
};
export const personId = (name: string) => 'p-' + slug(name);

const mkPerson = (name: string, company: string, title: string, domain: string, internal: boolean, disc?: string): Person => {
  const [f, ...l] = name.split(' ');
  return { id: personId(name), name, company, title, initials: initials(name), phone: phoneFor(name), email: `${slug(f)[0]}${slug(l.join(''))}@${domain}`, disc, internal };
};

/** Named people from the original design stay as they were. */
export const HUDSON: Person = { ...mkPerson('Hudson Alvarez', 'Maxen', 'Building manager', 'maxen.ca', true, 'Property management'), email: 'hudson.alvarez@maxen.ca', phone: '(514) 555-0142' };
export const CRISTOPHER: Person = { ...mkPerson('Cristopher Cardenas', 'Shepard', 'Technician', 'shepard.com', false, 'Electricity'), phone: '(514) 897-6312' };
export const JON: Person = mkPerson('Jon Snow', 'Shepard', 'Technician', 'shepard.com', false, 'Electricity');

const names = (() => {
  const r = rng('people');
  const used = new Set(['Hudson Alvarez', 'Cristopher Cardenas', 'Jon Snow']);
  const out: string[] = [];
  while (out.length < 70) {
    const n = `${pick(r, FIRST_NAMES)} ${pick(r, LAST_NAMES)}`;
    if (!used.has(n)) { used.add(n); out.push(n); }
  }
  return out;
})();

/** Maxen staff other than Hudson. */
export const INTERNAL: Person[] = names.slice(0, 12).map((n, i) => {
  const t = INT_TITLES[i % INT_TITLES.length];
  return mkPerson(n, 'Maxen', t, 'maxen.ca', true, INT_DISC[t]);
});

export const EXTERNAL: Person[] = (() => {
  const out = names.slice(12).map((n, i) => {
    const s = SUPPLIERS[i % SUPPLIERS.length];
    return mkPerson(n, s.name, pick(rng('title|' + n), EXT_TITLES), s.domain, false, s.disc);
  });
  out.splice(4, 0, CRISTOPHER);
  out.splice(9, 0, JON);
  return out;
})();

export const PEOPLE: Person[] = [HUDSON, ...INTERNAL, ...EXTERNAL];
export const PEOPLE_BY_ID: Record<string, Person> = Object.fromEntries(PEOPLE.map((p) => [p.id, p]));
export const peopleAt = (company: string) => EXTERNAL.filter((p) => p.company === company);
export const isCrew = (p: Person) => /echnician|Foreman/.test(p.title);
export const shuffled = (key: string) => shuffle(rng(key), PEOPLE);
