import { int, pick, type Rng } from '../lib/rng';

/** [domain, type, English label, French label, tag prefix, brands, rooms where it fits]
 *  Rooms: k kitchen, m meeting room, g any room, r rooftop, x mechanical room. */
export type CatalogEntry = readonly [string, string, string, string, string, readonly string[], string];

export const ASSET_CATALOG: CatalogEntry[] = [
  ['Kitchen equipment', 'Dishwasher', 'Commercial dishwasher', 'Lave-vaisselle commercial', 'DW', ['Hobart', 'Champion', 'Jackson'], 'k'],
  ['Kitchen equipment', 'Range hood', 'Exhaust hood', 'Hotte de cuisine', 'EH', ['CaptiveAire', 'Halton'], 'k'],
  ['Kitchen equipment', 'Combi oven', 'Combi oven', 'Four mixte', 'OV', ['Rational', 'Garland'], 'k'],
  ['Kitchen equipment', 'Fryer', 'Deep fryer', 'Friteuse', 'FR', ['Frymaster', 'Pitco'], 'k'],
  ['Refrigeration', 'Walk-in cooler', 'Walk-in cooler', 'Chambre froide', 'WIC', ['Kolpak', 'Foster'], 'k'],
  ['Refrigeration', 'Refrigerator', 'Reach-in refrigerator', 'Réfrigérateur vertical', 'RF', ['True', 'Traulsen'], 'k'],
  ['Refrigeration', 'Ice machine', 'Ice machine', 'Machine à glace', 'IM', ['Hoshizaki', 'Manitowoc', 'Scotsman'], 'k'],
  ['Plumbing', 'Water heater', 'Water heater', 'Chauffe-eau', 'WH', ['A.O. Smith', 'Rheem', 'Bradford White'], 'kx'],
  ['Plumbing', 'Grease interceptor', 'Grease interceptor', 'Séparateur de graisse', 'GI', ['Zurn', 'Watts'], 'kx'],
  ['Plumbing', 'Backflow preventer', 'Backflow preventer', 'Dispositif antirefoulement', 'BF', ['Watts', 'Zurn'], 'kx'],
  ['Plumbing', 'Faucet', 'Faucet', 'Robinet', 'W', ['Moen', 'Delta'], 'g'],
  ['Plumbing', 'Circulation pump', 'Circulation pump', 'Pompe de circulation', 'P', ['Grundfos', 'Armstrong'], 'x'],
  ['HVAC', 'Air handling unit', 'Air handling unit', 'Unité de traitement d’air', 'AHU', ['Trane', 'Daikin', 'Carrier'], 'x'],
  ['HVAC', 'Fan coil', 'Fan coil unit', 'Ventilo-convecteur', 'FC', ['Daikin', 'Trane'], 'gm'],
  ['HVAC', 'Exhaust fan', 'Exhaust fan', 'Ventilateur d’extraction', 'EF', ['Greenheck', 'Loren Cook'], 'krx'],
  ['HVAC', 'VAV box', 'VAV box', 'Boîte VAV', 'VAV', ['Price', 'Titus'], 'gm'],
  ['HVAC', 'Thermostat', 'Thermostat', 'Thermostat', 'TS', ['Honeywell', 'Siemens'], 'kgm'],
  ['HVAC', 'Rooftop unit', 'Rooftop unit', 'Unité de toiture', 'RTU', ['Trane', 'Carrier', 'Lennox'], 'r'],
  ['HVAC', 'Condenser', 'Condensing unit', 'Unité de condensation', 'CU', ['Copeland', 'Daikin'], 'r'],
  ['HVAC', 'Boiler', 'Boiler', 'Chaudière', 'B', ['Viessmann', 'Cleaver-Brooks'], 'x'],
  ['HVAC', 'Chiller', 'Chiller', 'Refroidisseur', 'CH', ['Carrier', 'Trane'], 'x'],
  ['HVAC', 'Cooling tower', 'Cooling tower', 'Tour de refroidissement', 'CT', ['Baltimore Aircoil', 'Evapco'], 'r'],
  ['Electrical', 'Panelboard', 'Electrical panel', 'Panneau électrique', 'PE', ['Schneider Electric', 'Eaton', 'Siemens'], 'kx'],
  ['Electrical', 'Lighting', 'LED light fixture', 'Luminaire DEL', 'LT', ['Lithonia', 'Philips'], 'kgm'],
  ['Electrical', 'Emergency lighting', 'Emergency light', 'Éclairage d’urgence', 'EL', ['Beghelli', 'Lithonia'], 'kgm'],
  ['Electrical', 'Solar inverter', 'Solar inverter', 'Onduleur solaire', 'INV', ['SMA', 'Fronius'], 'r'],
  ['Electrical', 'Generator', 'Emergency generator', 'Génératrice d’urgence', 'GEN', ['Cummins', 'Caterpillar'], 'x'],
  ['Electrical', 'Transfer switch', 'Automatic transfer switch', 'Commutateur de transfert', 'ATS', ['ASCO', 'Eaton'], 'x'],
  ['Electrical', 'UPS', 'UPS', 'Onduleur UPS', 'UPS', ['APC', 'Eaton'], 'x'],
  ['Fire safety', 'Extinguisher', 'Fire extinguisher', 'Extincteur', 'EX', ['Amerex', 'Kidde'], 'kgmr'],
  ['Fire safety', 'Smoke detector', 'Smoke detector', 'Détecteur de fumée', 'SD', ['System Sensor', 'Edwards'], 'kgm'],
  ['Fire safety', 'Sprinkler valve', 'Sprinkler zone valve', 'Vanne de gicleurs', 'SP', ['Viking', 'Tyco'], 'x'],
  ['Fire safety', 'Fire alarm panel', 'Fire alarm panel', 'Panneau d’alarme incendie', 'FACP', ['Notifier', 'Edwards'], 'x'],
  ['Fire safety', 'Fire damper', 'Fire damper', 'Clapet coupe-feu', 'FD', ['Ruskin', 'Greenheck'], 'gx'],
  ['Vertical transport', 'Elevator', 'Passenger elevator', 'Ascenseur', 'ELV', ['Otis', 'Schindler', 'KONE'], 'x'],
  ['Audio-visual', 'Display', 'Wall display', 'Écran mural', 'TV', ['Samsung', 'LG', 'Sony'], 'm'],
  ['Audio-visual', 'Video conferencing', 'Conference system', 'Système de visioconférence', 'VC', ['Poly', 'Logitech', 'Cisco'], 'm'],
  ['IT', 'Wireless access point', 'Wi-Fi access point', 'Point d’accès Wi-Fi', 'AP', ['Cisco', 'Aruba'], 'gm'],
  ['Building automation', 'Controller', 'BMS controller', 'Contrôleur GTB', 'BMS', ['Johnson Controls', 'Distech Controls', 'Siemens'], 'xr'],
  ['Building automation', 'Gas detection', 'CO sensor', 'Détecteur de CO', 'CO', ['Honeywell', 'MSA'], 'x'],
  ['Roofing', 'Roof drain', 'Roof drain', 'Drain de toit', 'RD', ['Zurn', 'Jay R. Smith'], 'r'],
  ['Architectural', 'Door closer', 'Door closer', 'Ferme-porte', 'DC', ['LCN', 'Dorma'], 'g'],
  ['Exterior', 'Loading dock', 'Loading dock bay', 'Quai de chargement', 'LD', ['Rite-Hite', 'Kelley'], 'x'],
];

/** Which supplier looks after each asset domain. */
export const DOMAIN_SUPPLIER: Record<string, string> = {
  'Kitchen equipment': 'Entretien Lumina', Refrigeration: 'Réfrigération Boréal', Plumbing: 'Plomberie Saint-Laurent', HVAC: 'Mécanique Laurentide',
  Electrical: 'Shepard', 'Fire safety': 'Vigil Sécurité Incendie', 'Vertical transport': 'Ascenseurs Montcalm', 'Audio-visual': 'Northline Controls', IT: 'Northline Controls',
  'Building automation': 'Northline Controls', Roofing: 'Toitures Mont-Royal', Architectural: 'Entretien Lumina', Exterior: 'Entretien Lumina',
};

type SpecGen = (r: Rng) => [string, string][];
const SPEC_BY_DOMAIN: Record<string, SpecGen> = {
  HVAC: (r) => [['Air flow', `${int(r, 400, 9000)} L/s`], ['Motor power', `${pick(r, [1.5, 2.2, 3.7, 5.5, 7.5, 11, 15])} kW`], ['Voltage', `${pick(r, [208, 575])} V`], ['Voltage phase', '3'], ['Voltage frequency', '60 Hz']],
  Electrical: (r) => [['Voltage', `${pick(r, [120, 208, 347, 600])} V`], ['Rated current', `${pick(r, [20, 60, 100, 225, 400])} A`], ['Voltage frequency', '60 Hz']],
  Plumbing: (r) => [['Capacity', `${int(r, 20, 400)} L`], ['Max working pressure', `${pick(r, [690, 860, 1030])} kPa`]],
  'Fire safety': (r) => [['Standard', pick(r, ['NFPA 10', 'NFPA 72', 'NFPA 25', 'CAN/ULC-S536'])], ['Service interval', pick(r, ['Monthly', 'Annual'])]],
  'Kitchen equipment': (r) => [['Power', `${pick(r, [3.2, 6, 9, 12, 18])} kW`], ['Voltage', `${pick(r, [208, 240, 600])} V`]],
  Refrigeration: (r) => [['Cooling capacity', `${pick(r, [1.2, 2.4, 3.6, 5.5])} kW`], ['Refrigerant', pick(r, ['R-448A', 'R-449A', 'R-290'])]],
  'Vertical transport': (r) => [['Capacity', `${pick(r, [1130, 1360, 1800])} kg`], ['Speed', `${pick(r, [1.0, 1.6, 2.5])} m/s`], ['Stops', String(int(r, 4, 12))]],
  'Building automation': (r) => [['Protocol', pick(r, ['BACnet/IP', 'BACnet MS/TP', 'Modbus'])], ['Points', String(int(r, 24, 160))]],
  'Audio-visual': (r) => [['Resolution', pick(r, ['1080p', '4K'])], ['Power', `${int(r, 40, 220)} W`]],
  IT: (r) => [['Standard', pick(r, ['Wi-Fi 6', 'Wi-Fi 6E'])], ['Power over Ethernet', '802.3at']],
  Roofing: () => [['Material', 'Cast iron'], ['Outlet size', '100 mm']],
  Architectural: () => [['Door size', '915 mm'], ['Hold-open', 'No']],
  Exterior: () => [['Door size', '2.4 m × 2.7 m'], ['Dock leveller', 'Hydraulic']],
};
export const specsFor = (domain: string, r: Rng) => (SPEC_BY_DOMAIN[domain]?.(r) ?? []).map(([name, value]) => ({ name, value }));

export const SOLAR_SPECS = [
  { name: 'Panel count', value: '312' }, { name: 'Rated power', value: '65 kW DC' }, { name: 'Module efficiency', value: '20.4 %' },
  { name: 'Open-circuit voltage', value: '49.6 V' }, { name: 'Tilt', value: '30° (winter 55°)' }, { name: 'Voltage frequency', value: '60 Hz' },
];
