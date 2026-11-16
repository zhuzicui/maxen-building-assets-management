import { useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Chip, STATUS_CLASS } from '../components/Chip';
import { ContactCard, NotesCard, PRIORITY_CHIP } from '../components/common';
import { PageHead } from '../components/Header';
import { Icon } from '../components/Icon';
import { MenuItem, Modal, PopMenu, toast } from '../ui';
import { fmt } from '../lib/dates';
import { EXTERNAL, HUDSON, INTERNAL, PEOPLE_BY_ID } from '../data/people';
import { SEED } from '../data/seed';
import { useAssets, useStore, useWorkOrder } from '../store/store';
import { STATUSES, type ChecklistGroup, type WorkOrder } from '../types';

const ASSIGNABLE = [HUDSON, ...INTERNAL, ...EXTERNAL.filter((p) => /echnician|Foreman/.test(p.title))];
const COMPANIES = [...new Set(ASSIGNABLE.map((p) => p.company))];

export function WorkOrderPage() {
  const { id } = useParams();
  const wo = useWorkOrder(id);
  const assets = useAssets();
  const { setStatus, patchWO, toggleTask } = useStore();
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<number | null>(null);
  const statusRef = useRef<HTMLButtonElement>(null);
  if (!wo) return <Navigate to="/building/work-orders" replace />;
  const fr = !!wo.french;
  const b = SEED.buildings.find((x) => x.id === wo.buildingId);
  const who = PEOPLE_BY_ID[wo.assigneeId];
  const last = wo.groups.length - 1;
  const linked = wo.assetIds.map((aid) => assets.find((a) => a.id === aid)).filter(Boolean);
  const progress = wo.groups.flatMap((g) => g.tasks);
  const done = progress.filter((t) => t.done).length;
  return (
    <main className="page">
      <PageHead title={wo.name} back="/building/work-orders" backLabel="Back to work orders"
        extra={<>
          <button ref={statusRef} className={`chip ${STATUS_CLASS[wo.status]}`} style={{ height: 30, padding: '0 10px', fontSize: 13 }} aria-haspopup="menu" aria-label={`Status: ${wo.status}. Change status`} onClick={() => setMenu(!menu)}>{wo.status} <Icon name="chev" size={14} /></button>
          {menu && <PopMenu anchor={statusRef.current} onClose={() => setMenu(false)}>
            {STATUSES.map((s) => <MenuItem key={s} onClick={() => { setMenu(false); setStatus(wo.id, s); toast(`Status changed to ${s}`); }}><Chip status={s} /></MenuItem>)}</PopMenu>}
        </>} />
      <div className="tri">
        <div className="col" style={{ gap: 16 }}>
          <p style={{ margin: 0 }}>{wo.description}</p>
          <div className="imgs"><span className="ph-img"><Icon name="img" size={18} /></span><span className="ph-img"><Icon name="img" size={18} /></span></div>
          <div className="kv">
            <div><b>Building:</b> {b?.name}</div>
            <div><b>Recurrence:</b> {wo.recurrence}</div>
            <div><b>Priority:</b> <span className={`chip ${PRIORITY_CHIP[wo.priority]}`}>{wo.priority}</span></div>
            <div><b>Maintenance category:</b> {wo.category} / {wo.type}</div>
            <div><b>Estimated duration:</b> {wo.duration}{wo.actualHours != null && <> · took {wo.actualHours} h</>}</div>
            <div><label htmlFor="due"><b>Due date:</b></label> <input id="due" type="date" value={wo.due} onChange={(e) => e.target.value && patchWO(wo.id, { due: e.target.value })} style={{ border: '1px solid var(--line-strong)', borderRadius: 6, padding: '2px 6px', background: 'var(--paper)', color: 'var(--fg)' }} aria-label={`Due date, currently ${fmt(wo.due)}`} /> <Link to="/calendar" style={{ fontWeight: 700, fontSize: 13, marginLeft: 6 }}>Open calendar</Link></div>
            {linked.length > 0 && <div><b>{linked.length === 1 ? 'Asset' : 'Assets'}:</b> {linked.map((a, i) => <span key={a!.id}>{i > 0 && ', '}<Link to={`/assets/${a!.id}`} style={{ color: 'var(--primary)' }}>{a!.name}</Link></span>)}</div>}
            <div><label htmlFor="assignee"><b>Assigned to:</b></label>{' '}
              <select id="assignee" value={wo.assigneeId} onChange={(e) => { const p = PEOPLE_BY_ID[e.target.value]; patchWO(wo.id, { assigneeId: p.id, supplier: p.company }); toast(`Assigned to ${p.name}`); }}
                style={{ border: '1px solid var(--line-strong)', borderRadius: 6, padding: '2px 6px', background: 'var(--paper)', color: 'var(--fg)', maxWidth: '100%' }}>
                {COMPANIES.map((c) => <optgroup key={c} label={c}>{ASSIGNABLE.filter((p) => p.company === c).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</optgroup>)}
              </select></div>
          </div>
          {who && <ContactCard p={who} bare />}
        </div>
        <section className="card checklist"><div style={{ padding: '24px 20px' }}><h3 style={{ fontSize: 18 }}>Checklist</h3><p style={{ margin: '4px 0 0', color: 'var(--fg-2)' }}>{done} of {progress.length} tasks done</p></div>
          {wo.groups.map((g, gi) => {
            const all = g.tasks.every((t) => t.done);
            const assetId = g.assetId;
            return (
              <div className="grp" key={g.id}><div className="grp-h"><b>{gi !== last && assetId ? <Link to={`/assets/${assetId}`} style={{ color: 'inherit' }}>{g.title}</Link> : g.title}</b>
                {all ? <span style={{ color: 'var(--green)' }} aria-label="All tasks done"><Icon name="check" size={22} /></span> : <button className="btn btn-primary" onClick={() => setModal(gi)}>{fr ? 'Commencer' : 'Start working'}</button>}</div>
                {g.tasks.map((t, ti) => (
                  <label className="task" key={t.id}><input type="checkbox" checked={t.done} onChange={(e) => toggleTask(wo.id, gi, ti, e.target.checked)} /><span>{t.text}{t.reading ? ` — ${t.reading} ${t.unit ?? ''}` : ''}</span></label>
                ))}
              </div>
            );
          })}
        </section>
        <NotesCard kind="wo" id={wo.id} notes={wo.notes} />
      </div>
      {modal !== null && <ChecklistModal wo={wo} gi={modal} onClose={() => setModal(null)} />}
    </main>
  );
}

function ChecklistModal({ wo, gi, onClose }: { wo: WorkOrder; gi: number; onClose: () => void }) {
  const g: ChecklistGroup = wo.groups[gi];
  const [tasks, setTasks] = useState(g.tasks);
  const save = useStore((s) => s.saveGroup);
  const upd = (i: number, p: Partial<ChecklistGroup['tasks'][number]>) => setTasks(tasks.map((t, j) => (j === i ? { ...t, ...p } : t)));
  return (
    <Modal onClose={onClose} labelledBy="mh">
      <h3 id="mh">Checklist</h3><b>{g.title}</b>
      {tasks.map((t, i) => (
        <div key={t.id}>
          <label className="task" style={{ color: 'var(--fg)' }}><input type="checkbox" checked={t.done} onChange={(e) => upd(i, { done: e.target.checked })} /><span>{t.text}</span></label>
          {t.unit && (
            <div className="frow" style={{ paddingLeft: 32, maxWidth: 340 }}>
              <div className="ff"><label htmlFor={`r-${t.id}`}>Reading</label><input id={`r-${t.id}`} inputMode="decimal" value={t.reading ?? ''} onChange={(e) => upd(i, { reading: e.target.value })} placeholder="Reading" /></div>
              <div className="ff"><label>Unit</label><input value={t.unit} readOnly aria-label="Unit" /></div>
            </div>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <button className="btn btn-ghost-red" onClick={onClose}>Don't save</button>
        <button className="btn btn-primary btn-lg" onClick={() => { save(wo.id, gi, tasks); onClose(); toast('Progress saved'); }}>Save progress</button>
      </div>
    </Modal>
  );
}
