import { useCallback, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Logo } from './brand';
import { Icon } from './Icon';
import { MenuItem, Modal, PopMenu, toast } from '../ui';
import { SEED } from '../data/seed';
import { useCurrentUser, useStore } from '../store/store';

type Menu = null | 'logo' | 'buildings' | 'account';

export function Header() {
  const [menu, setMenu] = useState<Menu>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const anchors = useRef<Record<string, HTMLElement | null>>({});
  const nav = useNavigate();
  const { pathname } = useLocation();
  const user = useCurrentUser();
  const { setBuilding, setRole, setTheme, resetDemo, buildingId, role } = useStore();
  const close = useCallback(() => setMenu(null), []);
  const toggle = (m: Exclude<Menu, null>) => setMenu((cur) => (cur === m ? null : m));
  const go = (to: string) => { close(); nav(to); };
  const cls = ({ isActive }: { isActive: boolean }) => `nav-item${isActive ? ' on' : ''}`;
  const buildingActive = ['/building', '/assets', '/work-orders', '/calendar', '/new-'].some((p) => pathname.startsWith(p));
  const switchTheme = () => {
    const dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(dark ? 'light' : 'dark');
  };

  return (
    <header className="top"><div className="top-in">
      <button className="logo-btn" aria-label="Switch view" ref={(e) => { anchors.current.logo = e; }} onClick={() => toggle('logo')}><Logo size={40} /></button>
      <nav className="nav" aria-label="Main">
        <NavLink className={cls} to="/analytics">Analytics</NavLink>
        <button className={`nav-item${buildingActive ? ' on' : ''}`} ref={(e) => { anchors.current.buildings = e; }} onClick={() => toggle('buildings')}>Buildings <Icon name="chev" size={16} /></button>
        <NavLink className={cls} to="/contacts">Contacts</NavLink>
        <span className="nav-sep" />
        <NavLink className={cls} to="/my-work">Work orders assigned to me</NavLink>
      </nav>
      <div className="top-r">
        <button className="icon-btn" aria-label="Switch light or dark" onClick={switchTheme}><Icon name="contrast" size={22} /></button>
        <button aria-label="Account" style={{ borderRadius: '50%' }} ref={(e) => { anchors.current.account = e; }} onClick={() => toggle('account')}><Avatar initials={user.initials} size={40} /></button>
      </div>
      {menu === 'logo' && (
        <PopMenu anchor={anchors.current.logo} onClose={close}>
          <div className="pop-head"><b>Switch view</b><span>Demo roles</span></div>
          <MenuItem onClick={() => { setRole('manager'); go('/analytics'); }}>Portfolio manager<small>All buildings, analytics home</small></MenuItem>
          <MenuItem onClick={() => { setRole('manager'); go('/building'); }}>Only one building<small>Lands on {SEED.buildings.find((b) => b.id === buildingId)?.name}</small></MenuItem>
          <MenuItem onClick={() => { setRole('technician'); go('/my-work'); }}>Technician<small>Only my work orders{role === 'technician' ? ' (current)' : ''}</small></MenuItem>
        </PopMenu>
      )}
      {menu === 'buildings' && (
        <PopMenu anchor={anchors.current.buildings} onClose={close}>
          {SEED.buildings.map((b) => <MenuItem key={b.id} onClick={() => { setBuilding(b.id); go('/building'); }}><Icon name="bldg" size={18} /> {b.name}</MenuItem>)}
        </PopMenu>
      )}
      {menu === 'account' && (
        <PopMenu anchor={anchors.current.account} onClose={close} align="right">
          <div className="pop-head"><b>{user.name}</b><span>{user.email}</span></div><hr />
          <MenuItem onClick={() => go('/profile')}>Profile</MenuItem>
          <MenuItem onClick={() => go('/my-work')}>My work orders</MenuItem>
          <MenuItem onClick={() => { close(); setConfirmReset(true); }}>Reset demo data<small>Removes everything you created or changed</small></MenuItem>
          <hr /><button className="mi danger" onClick={() => { close(); nav('/login'); }}><Icon name="logout" size={18} /> Logout</button>
        </PopMenu>
      )}
      {confirmReset && (
        <Modal onClose={() => setConfirmReset(false)} labelledBy="reset-h">
          <h3 id="reset-h">Reset demo data?</h3>
          <p style={{ margin: 0 }}>This removes every work order and asset you created and undoes your changes, in this browser only.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <button className="btn btn-soft" onClick={() => setConfirmReset(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { resetDemo(); setConfirmReset(false); toast('Demo data reset'); nav('/analytics'); }}>Reset</button>
          </div>
        </Modal>
      )}
    </div></header>
  );
}

export function PageHead({ title, back, backLabel = 'Back', extra, more }: { title: string; back?: string; backLabel?: string; extra?: React.ReactNode; more?: React.ReactNode }) {
  return (
    <div className="ph"><div>{back && <Link className="back" to={back}><Icon name="back" size={16} /> {backLabel}</Link>}<h1>{title}{extra}</h1></div>{more}</div>
  );
}
