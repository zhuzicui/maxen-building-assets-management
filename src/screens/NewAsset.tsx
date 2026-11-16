import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormPage, SelectField, TextArea, TextField, UploadStub } from '../components/FormFields';
import { Icon } from '../components/Icon';
import { toast } from '../ui';
import { ASSET_CATALOG, DOMAIN_SUPPLIER } from '../data/catalog';
import { floorLabels } from '../data/buildings';
import { SUPPLIERS, peopleAt, isCrew } from '../data/people';
import { SEED, roomsFor } from '../data/seed';
import { useAssets, useBuilding, useStore } from '../store/store';

const DOMAINS = [...new Set(ASSET_CATALOG.map((c) => c[0]))].sort();

export function NewAsset() {
  const nav = useNavigate();
  const cur = useBuilding();
  const assets = useAssets();
  const createAsset = useStore((s) => s.createAsset);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [buildingId, setBuildingId] = useState(cur.id);
  const [domain, setDomain] = useState('');
  const [type, setType] = useState('');
  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [wEnd, setWEnd] = useState('');
  const [specs, setSpecs] = useState<{ name: string; value: string }[]>([]);
  const [supplier, setSupplier] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const building = SEED.buildings.find((b) => b.id === buildingId)!;
  const wingIdx = building.wings.findIndex((w) => w.name === wing);
  const floors = wingIdx >= 0 ? floorLabels(building.wings[wingIdx]) : [];
  const rooms = wingIdx >= 0 && floor ? roomsFor(building, wingIdx, floor) : [];
  const types = useMemo(() => [...new Set(ASSET_CATALOG.filter((c) => !domain || c[0] === domain).map((c) => c[1]))].sort(), [domain]);

  const save = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Give the asset a name.';
    if (!domain) e.domain = 'Choose a category.';
    if (!type) e.type = 'Choose a type.';
    if (!wing) e.wing = 'Choose a wing.';
    if (!floor) e.floor = 'Choose a floor.';
    if (!room) e.room = 'Choose a room.';
    if (year && !/^\d{4}$/.test(year)) e.year = 'Use a four-digit year.';
    if (!e.name && assets.some((a) => a.buildingId === buildingId && a.name.toLowerCase() === name.trim().toLowerCase())) e.name = 'An asset with this name already exists in this building.';
    setErrors(e);
    if (Object.keys(e).length) { toast('Fix the highlighted fields'); setTimeout(() => document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center' })); return; }
    const sup = supplier || DOMAIN_SUPPLIER[domain];
    const id = createAsset({
      buildingId, wing, floor, room, name: name.trim(), domain, type, brand: brand.trim() || 'Unknown', model: model.trim() || '—', year: Number(year) || new Date().getFullYear(), description: desc.trim() || undefined,
      specs: specs.filter((s) => s.name.trim() && s.value.trim()), docs: [], notes: [], contactIds: sup ? peopleAt(sup).filter(isCrew).slice(0, 2).map((p) => p.id) : [],
      ...(wEnd ? { warranty: { provider: brand.trim() || 'Supplier', start: `${year || new Date().getFullYear()}-01-01`, end: wEnd } } : {}),
    });
    toast('Asset created');
    nav(`/assets/${id}`);
  };
  const setSpec = (i: number, p: Partial<{ name: string; value: string }>) => setSpecs(specs.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <FormPage title="New asset" cta="Create asset" onCancel={() => nav(-1)} onSave={save} sections={[
      { id: 's-general', nav: 'General info*', title: 'General info*', sub: 'These are mandatory info to create an asset', body: (
        <div className="fbox"><TextField label="Asset name" required value={name} onChange={setName} error={errors.name} /><TextArea label="Asset description (optional)" value={desc} onChange={setDesc} />
          <div className="frow">
            <SelectField label="Building" required value={buildingId} onChange={(v) => { setBuildingId(v); setWing(''); setFloor(''); setRoom(''); }} options={SEED.buildings.map((b) => ({ value: b.id, label: b.name }))} />
            <SelectField label="Category" required value={domain} onChange={(v) => { setDomain(v); setType(''); }} options={DOMAINS} error={errors.domain} />
            <SelectField label="Wing" required sub value={wing} onChange={(v) => { setWing(v); setFloor(''); setRoom(''); }} options={building.wings.map((w) => w.name)} error={errors.wing} />
            <SelectField label="Type" required sub value={type} onChange={setType} options={types} error={errors.type} />
            <SelectField label="Floor" required sub value={floor} onChange={(v) => { setFloor(v); setRoom(''); }} options={floors} error={errors.floor} />
            <SelectField label="Room" required sub value={room} onChange={setRoom} options={rooms} error={errors.room} />
          </div></div>) },
      { id: 's-ident', nav: 'Identifiers', title: 'Identifiers', sub: 'These data help you identify your asset', body: (
        <div className="fbox"><div className="frow"><TextField label="Brand" value={brand} onChange={setBrand} /><TextField label="Model" value={model} onChange={setModel} /><TextField label="Installation year" value={year} onChange={setYear} error={errors.year} /><TextField label="Warranty ends (optional)" type="date" value={wEnd} onChange={setWEnd} /></div></div>) },
      { id: 's-spec', nav: 'Specifications', title: 'Specifications', sub: 'Optional technical data, like voltage or capacity', body: (
        <>{specs.length > 0 && <div className="fbox">{specs.map((s, i) => (
          <div key={i} className="frow three"><TextField label="Name" value={s.name} onChange={(v) => setSpec(i, { name: v })} /><TextField label="Value" value={s.value} onChange={(v) => setSpec(i, { value: v })} /><div style={{ display: 'flex', alignItems: 'center' }}><button type="button" className="txt-btn" style={{ color: 'var(--red)' }} onClick={() => setSpecs(specs.filter((_, j) => j !== i))}>Remove</button></div></div>))}</div>}
          <button type="button" className="add-link" onClick={() => setSpecs([...specs, { name: '', value: '' }])}><Icon name="plus" size={16} /> Add a specification</button></>) },
      { id: 's-docs', nav: 'Documents', title: 'Documents', body: <UploadStub /> },
      { id: 's-contacts', nav: 'Contacts', title: 'Contacts', sub: 'Defaults to the supplier that looks after this category', body: (
        <div className="fbox"><SelectField label="Supplier (company)" value={supplier} onChange={setSupplier} options={SUPPLIERS.map((s) => s.name)} /></div>) },
    ]} />
  );
}
