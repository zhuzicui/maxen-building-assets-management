import type { Building } from '../types';

/** Maison de Radio-Canada comes from the original design; the others are fictional, on real Montréal-area streets. */
export const BUILDINGS: Building[] = [
  { id: 'b-radio-canada', name: 'Maison de Radio-Canada', short: 'Radio-Canada', addr: 'Papineau / René-Levesque, Montréal, Québec', area: '418,822', year: 'Completed in 2020', photo: 'maison-radio-canada.jpg', desc: 'Headquarters of CBC/Radio-Canada in Montréal: studios, broadcast control rooms and offices.',
    wings: [{ name: 'Studios', floors: 11, roof: true }, { name: 'Administration', floors: 8, roof: true }, { name: 'Broadcast', floors: 6, roof: true }, { name: 'Services', floors: 3, roof: false }] },
  { id: 'b-saint-urbain', name: 'Complexe Saint-Urbain', short: 'Saint-Urbain', addr: '2000 rue Saint-Urbain, Montréal, Québec', area: '212,400', year: 'Built in 1987, renovated in 2016', desc: 'Mixed-use office complex with ground-floor retail and a public food court.',
    wings: [{ name: 'Tower A', floors: 9, roof: true }, { name: 'Tower B', floors: 7, roof: true }, { name: 'Retail podium', floors: 3, roof: false }] },
  { id: 'b-champlain', name: 'Tour Champlain', short: 'Champlain', addr: '1250 boulevard Robert-Bourassa, Montréal, Québec', area: '486,000', year: 'Built in 1992', desc: '32-storey office tower downtown, connected to the underground city.',
    wings: [{ name: 'Tower', floors: 18, roof: true }, { name: 'Podium', floors: 4, roof: true }, { name: 'Underground', floors: 2, roof: false }] },
  { id: 'b-papineau', name: 'Pavillon Papineau', short: 'Papineau', addr: '2285 avenue Papineau, Montréal, Québec', area: '96,300', year: 'Built in 1965, renovated in 2018', desc: 'Former printing plant converted to creative offices and production studios.',
    wings: [{ name: 'Main hall', floors: 4, roof: true }, { name: 'Studio annex', floors: 2, roof: true }] },
  { id: 'b-sainte-catherine', name: 'Édifice Sainte-Catherine', short: 'Sainte-Catherine', addr: '755 rue Sainte-Catherine Ouest, Montréal, Québec', area: '158,900', year: 'Built in 1931', desc: 'Heritage department store building, now offices above street-level retail.',
    wings: [{ name: 'East block', floors: 8, roof: true }, { name: 'West block', floors: 8, roof: true }] },
  { id: 'b-lachine', name: 'Entrepôt Lachine', short: 'Lachine', addr: '3100 rue Notre-Dame, Lachine, Québec', area: '341,000', year: 'Built in 2008', desc: 'Distribution warehouse with cold storage and a 40-door loading dock.',
    wings: [{ name: 'Warehouse', floors: 1, roof: true }, { name: 'Cold storage', floors: 1, roof: true }, { name: 'Offices', floors: 2, roof: true }] },
  { id: 'b-laval', name: 'Campus Laval', short: 'Laval', addr: '1800 boulevard Le Corbusier, Laval, Québec', area: '274,500', year: 'Completed in 2015', desc: 'Three-building office campus with an underground parking garage.',
    wings: [{ name: 'Building A', floors: 5, roof: true }, { name: 'Building B', floors: 5, roof: true }, { name: 'Building C', floors: 5, roof: true }, { name: 'Parking garage', floors: 3, roof: false }] },
];

export const floorLabels = (wing: { floors: number; roof: boolean }): string[] => [
  ...Array.from({ length: wing.floors }, (_, i) => `Floor ${i + 1}`),
  ...(wing.roof ? ['Rooftop'] : []),
];
