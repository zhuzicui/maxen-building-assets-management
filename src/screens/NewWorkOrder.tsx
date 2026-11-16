import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FormPage, SelectField, TextArea, TextField, UploadStub } from '../components/FormFields';
import { Icon } from '../components/Icon';
import { toast } from '../ui';
import { addDays, todayIso } from '../lib/dates';
import { DURATIONS } from '../lib/duration';
import { floorLabels } from '../data/buildings';
import { EXTERNAL, HUDSON, isCrew } from '../data/people';
import { SEED } from '../data/seed';
import { WO_SPECS } from '../data/woSpecs';
import { useAssets, useBuilding, useStore } from '../store/store';
import { PRIORITIES, STATUSES, type ChecklistGroup, type Priority, type Status } from '../types';

const CATEGORIES = [...new Set(WO_SPECS.map((s) => s.category))].sort();
const RECURRENCES = ['One time', ...new Set(WO_SPECS.map((s) => s.recurrence).filter((r) => r !== 'One time'))];
const PEOPLE = [HUDSON, ...EXTERNAL.filter(isCrew)];
const COMPANIES = [...new Set(PEOPLE.map((p) => p.company))];

export function NewWorkOrder() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const cur = useBuilding();
  const assets = useAssets();
  const createWO = useStore((s) => s.createWO);
  const pre = assets.find((a) => a.id === params.get('asset'));
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [buildingId, setBuildingId] = useState(pre?.buildingId ?? cur.id);
  const [wing, setWing] = useState(pre?.wing ?? '');
  const [floor, setFloor] = useState(pre?.floor ?? '');
  const [assetId, setAssetId] = useState(pre?.id ?? '');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [due, setDue] = useState(addDays(todayIso(), 7));
  const [recurrence, setRecurrence] = useState('One time');
  const [duration, setDuration] = useState('2 hours');
  const [status, setStatus] = useState<Status>('Planned');
  const [company, setCompany] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [tasks, setTasks] = useState<string[]>(['']);
  const [template, setTemplate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const building = SEED.buildings.find((b) => b.id === buildingId)!;
  const wingObj = building.wings.find((w) => w.name === wing);
  const floorsList = wingObj ? floorLabels(wingObj) : [];
  const assetOptions = useMemo(() => (wing && floor ? assets.filter((a) => a.buildingId === buildingId && a.wing === wing && a.floor === floor) : []), [assets, buildingId, wing, floor]);
  const crew = PEOPLE.filter((p) => !company || p.company === company);

  const applyTemplate = (title: string) => {
    setTemplate(title);
    const s = WO_SPECS.find((x) => x.title === title);
    if (!s) return;
    setTasks(s.tasks.map((t) => t.replace(/\s*\[([^\]]+)\]$/, ' ($1)')));
    setCategory(s.category); setDuration(s.duration); setRecurrence(s.recurrence); setPriority(s.priority);
    if (!desc) setDesc(s.description);
    if (!name) setName(s.title);
  };
  const save = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Give the work order a name.';
    if (!assigneeId) e.assignee = 'Choose who will do the work.';
    if (!due) e.due = 'Pick a due date.';
    setErrors(e);
    if (Object.keys(e).length) { toast('Fix the highlighted fields'); document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ block: 'center' }); return; }
    const asset = assets.find((a) => a.id === assetId);
    const list = tasks.map((t) => t.trim()).filter(Boolean);
    const parsed = list.map((raw, i) => { const m = raw.match(/^(.*?)\s*\(([^)]{1,8})\)$/); return { id: `t${i}`, text: m ? m[1] : raw, unit: m ? m[2] : undefined, done: false }; });
    const groups: ChecklistGroup[] = [{ id: 'g0', title: asset ? asset.name : 'Tasks', assetId: asset?.id, tasks: parsed }];
    const person = PEOPLE.find((p) => p.id === assigneeId)!;
    const id = createWO({ buildingId, name: name.trim(), description: desc.trim() || 'No description.', category: category || 'General', type: asset?.type ?? 'General', recurrence, duration, priority, status, due, assigneeId, supplier: person.company, assetIds: asset ? [asset.id] : [], groups: list.length ? groups : [], notes: [] });
    toast('Work order created');
    nav(`/work-orders/${id}`);
  };
  const clearTask = (i: number) => setTasks(tasks.length === 1 ? [''] : tasks.filter((_, j) => j !== i));
  return (
    <FormPage title="New work order" cta="Create work order" onCancel={() => nav(-1)} onSave={save} sections={[
      { id: 'w-general', nav: 'General info*', title: 'General info*', sub: 'These are mandatory info to create a work order', body: (
        <div className="fbox">
          <SelectField label="Start from a template (optional)" value={template} onChange={applyTemplate} options={WO_SPECS.map((s) => s.title)} />
          <TextField label="Work order name" required value={name} onChange={setName} error={errors.name} />
          <TextArea label="Description (optional)" value={desc} onChange={setDesc} />
          <div className="frow">
            <SelectField label="Building" value={buildingId} onChange={(v) => { setBuildingId(v); setWing(''); setFloor(''); setAssetId(''); }} options={SEED.buildings.map((b) => ({ value: b.id, label: b.name }))} />
            <SelectField label="Maintenance category" value={category} onChange={setCategory} options={CATEGORIES} />
            <SelectField label="Wing" sub value={wing} onChange={(v) => { setWing(v); setFloor(''); setAssetId(''); }} options={building.wings.map((w) => w.name)} />
            <SelectField label="Priority" value={priority} onChange={(v) => setPriority(v as Priority)} options={PRIORITIES} />
            <SelectField label="Floor" sub value={floor} onChange={(v) => { setFloor(v); setAssetId(''); }} options={floorsList} />
            <SelectField label={wing && floor ? `Asset (${assetOptions.length} on this floor)` : 'Asset (pick a wing and floor first)'} value={assetId} onChange={setAssetId} options={assetOptions.map((a) => ({ value: a.id, label: a.name }))} />
          </div>
        </div>) },
      { id: 'w-sched', nav: 'Schedule', title: 'Schedule', sub: 'Set when this work order is due and how often it repeats', body: (
        <div className="fbox"><div className="frow">
          <TextField label="Due date" type="date" value={due} onChange={setDue} error={errors.due} />
          <SelectField label="Recurrence" value={recurrence} onChange={setRecurrence} options={RECURRENCES} />
          <SelectField label="Estimated duration" value={duration} onChange={setDuration} options={DURATIONS} />
          <SelectField label="Status" value={status} onChange={(v) => setStatus(v as Status)} options={STATUSES.filter((s) => s !== 'Completed' && s !== 'Overdue')} />
        </div></div>) },
      { id: 'w-assign', nav: 'Assignment', title: 'Assignment', body: (
        <div className="fbox"><div className="frow">
          <SelectField label="Supplier (company)" value={company} onChange={(v) => { setCompany(v); if (assigneeId && PEOPLE.find((p) => p.id === assigneeId)?.company !== v && v) setAssigneeId(''); }} options={COMPANIES} />
          <SelectField label="Assignee" required value={assigneeId} onChange={setAssigneeId} options={crew.map((p) => ({ value: p.id, label: `${p.name} (${p.company})` }))} error={errors.assignee} />
        </div></div>) },
      { id: 'w-check', nav: 'Checklist', title: 'Checklist', sub: 'Pick a template above or write your own tasks. Add a unit in brackets, like (°C), to ask for a reading.', body: (
        <div className="fbox">
          {tasks.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="ff" style={{ flex: 1 }}><label htmlFor={`task-${i}`}>Task {i + 1}</label><input id={`task-${i}`} value={t} onChange={(e) => setTasks(tasks.map((x, j) => (j === i ? e.target.value : x)))} /></div>
              <button type="button" className="txt-btn" style={{ color: 'var(--red)' }} aria-label={`Remove task ${i + 1}`} onClick={() => clearTask(i)}>Remove</button>
            </div>))}
          <button type="button" className="add-link" onClick={() => setTasks([...tasks, ''])}><Icon name="plus" size={16} /> Add a task</button>
        </div>) },
      { id: 'w-docs', nav: 'Documents', title: 'Documents', body: <UploadStub /> },
    ]} />
  );
}
