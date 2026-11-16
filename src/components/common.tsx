import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from './brand';
import { Chip } from './Chip';
import { Icon } from './Icon';
import { MenuItem, PopMenu, toast } from '../ui';
import { fmt, fmtTs } from '../lib/dates';
import { PEOPLE_BY_ID } from '../data/people';
import { SEED } from '../data/seed';
import { mergedAssets, useAssets, useStore } from '../store/store';
import type { Note, Person, Priority, WorkOrder } from '../types';

export function Accordion({ title, children, open: initial = false, dim = false }: { title: React.ReactNode; children: React.ReactNode; open?: boolean; dim?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <section className={`acc ${open ? 'open' : ''}`}>
      <button className={`acc-h ${dim ? 'dim' : ''}`} aria-expanded={open} onClick={() => setOpen(!open)}>{title}<span className="chev"><Icon name="chev" size={20} /></span></button>
      {open && <div className="acc-b">{children}</div>}
    </section>
  );
}

export const PRIORITY_CHIP: Record<Priority, string> = { High: 'c-red', Medium: 'c-amber', Low: 'c-green', None: 'c-grey' };

export function WoCard({ wo }: { wo: WorkOrder }) {
  const assets = useAssets();
  const first = wo.assetIds.map((id) => assets.find((a) => a.id === id)).find(Boolean);
  const b = SEED.buildings.find((x) => x.id === wo.buildingId);
  return (
    <Link className="card wo" to={`/work-orders/${wo.id}`}>
      <div className="wo-top"><Chip status={wo.status} /><span className={`chip ${PRIORITY_CHIP[wo.priority]}`}>{wo.priority === 'Low' && <Icon name="down" size={12} />} {wo.priority}</span></div>
      <h4>{wo.name}</h4>
      <div className="due">Due date: {fmt(wo.due)}</div>
      <p style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{wo.description}</p>
      <ul>
        <li><Icon name="user" size={16} />{PEOPLE_BY_ID[wo.assigneeId]?.name}</li>
        <li><Icon name="pin" size={16} />{b?.short}</li>
        <li><Icon name="wrench" size={16} />{first ? first.name : wo.category}</li>
        <li><Icon name="repeat" size={16} />{wo.recurrence}</li>
      </ul>
    </Link>
  );
}

export function ContactCard({ p, location, bare }: { p: Person; location?: string; bare?: boolean }) {
  const copy = (v: string) => { (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Copied ' + v)).catch(() => toast(v)); };
  const body = (
    <>
      <div className="cc-h"><Avatar initials={p.initials} size={48} /><div><b>{p.name}</b><span>{p.title}</span></div></div>
      <ul>
        <li><Icon name="brief" size={15} />{p.disc || p.title}</li>
        <li><Icon name="bldg" size={15} />{p.company}</li>
        {location && <li><Icon name="pinO" size={15} />{location}</li>}
        <li><Icon name="phone" size={15} />{p.phone} <button className="copy" onClick={() => copy(p.phone)} aria-label="Copy phone"><Icon name="copy" size={14} /></button></li>
        <li><Icon name="mail" size={15} />{p.email} <button className="copy" onClick={() => copy(p.email)} aria-label="Copy email"><Icon name="copy" size={14} /></button></li>
      </ul>
    </>
  );
  return bare ? <div className="card cc" style={{ padding: 20 }}>{body}</div> : <div className="card cc">{body}</div>;
}

export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const nav = useNavigate();
  return (
    <>
      <button className="more" aria-label="More actions" ref={ref} onClick={() => setOpen((o) => !o)}><Icon name="dots" size={20} /></button>
      {open && (
        <PopMenu anchor={ref.current} onClose={() => setOpen(false)} align="right">
          <MenuItem onClick={() => { setOpen(false); nav('/new-asset'); }}><Icon name="plus" size={18} /> Create new asset</MenuItem>
          <MenuItem onClick={() => { setOpen(false); nav('/new-work-order'); }}><Icon name="plus" size={18} /> Create new work order</MenuItem>
        </PopMenu>
      )}
    </>
  );
}

export function NotesCard({ kind, id, notes }: { kind: 'wo' | 'asset'; id: string; notes: Note[] }) {
  const [text, setText] = useState('');
  const { addNote, pinNote } = useStore();
  const post = () => { const v = text.trim(); if (!v) { toast('Write a note first'); return; } addNote(kind, id, v); setText(''); toast('Note posted'); };
  return (
    <section className="card notes">
      <h3 style={{ fontSize: 18 }}>Notes</h3>
      <textarea placeholder="Leave a note" aria-label="Leave a note" value={text} onChange={(e) => setText(e.target.value)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-soft" style={{ background: 'var(--field)' }} onClick={() => toast('Photo and video upload is not part of this demo')}><Icon name="media" size={20} /> Image/Video</button>
        <button className="btn btn-primary" onClick={post}>Post a note</button>
      </div>
      <div>
        {notes.length === 0 && <p className="empty-state">No notes yet.</p>}
        {notes.map((n) => (
          <div className="note" key={n.id}><span className="dot" />
            <div><p>{n.pinned ? '[Pinned] ' : ''}{n.text}</p>
              {!!n.imgs && <div className="imgs" style={{ marginTop: 6 }}>{Array.from({ length: n.imgs }, (_, i) => <span key={i} className="ph-img"><Icon name="img" size={18} /></span>)}</div>}
              <small>{n.who} • {fmtTs(n.when)}</small>
              {!n.pinned && <button className="btn btn-soft btn-sm" onClick={() => { pinNote(kind, id, n.id); toast('Note pinned'); }}>Pin note on top</button>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export { mergedAssets };
