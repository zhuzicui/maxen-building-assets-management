import { Avatar } from '../components/brand';
import { Icon } from '../components/Icon';
import { toast } from '../ui';
import { useCurrentUser, useStore } from '../store/store';

const PREFS = ['A work order is assigned to me', 'A work order I follow changes status', 'A work order becomes overdue', 'Someone leaves a note on my work order', 'A weekly summary of my buildings is ready'];

export function Profile() {
  const user = useCurrentUser();
  const prefs = useStore((s) => s.prefs);
  const setPref = useStore((s) => s.setPref);
  return (
    <main className="page"><div className="two" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
      <div><h1 style={{ fontSize: 32, marginBottom: 16 }}>Profile</h1>
        <section className="card" style={{ padding: 24, display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}><Avatar initials={user.initials} size={68} /><div><b style={{ fontSize: 18 }}>{user.name}</b><div style={{ color: 'var(--fg-2)' }}>{user.title} · {user.company}</div></div></div>
          <div className="kv" style={{ gap: 6, color: 'var(--fg-2)' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}><Icon name="brief" size={18} /><span style={{ color: 'var(--fg)' }}>{user.title}</span></div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}><Icon name="phone" size={18} /><span style={{ color: 'var(--fg)' }}>{user.phone}</span></div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}><Icon name="mail" size={18} /><span style={{ color: 'var(--fg)' }}>{user.email}</span></div></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><button className="btn btn-soft" onClick={() => toast('Profile editing is not part of this demo')}>Edit</button><button className="txt-btn" style={{ color: 'var(--red)' }} onClick={() => toast('This is a demo: there are no real accounts')}>Reset password</button></div></section></div>
      <div><h1 style={{ fontSize: 32, marginBottom: 16 }}>Communication preferences</h1>
        <section className="card" style={{ padding: 24, display: 'grid', gap: 4 }}><div className="flabel" style={{ marginBottom: 8 }}>Email me when</div>
          {PREFS.map((t, i) => <label className="task" style={{ color: 'var(--fg)' }} key={t}><input type="checkbox" checked={prefs[i]} onChange={(e) => setPref(i, e.target.checked)} /><span style={{ textDecoration: 'none', color: 'var(--fg)' }}>{t}</span></label>)}
          <small style={{ color: 'var(--fg-2)', marginTop: 8 }}>Saved in this browser. The demo does not send email.</small></section></div>
    </div></main>
  );
}
