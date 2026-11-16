import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wordmark } from '../components/brand';
import { Icon } from '../components/Icon';
import { toast } from '../ui';

export function Login() {
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!pw) { setErr(true); return; } nav('/analytics'); };
  return (
    <main className="login"><div className="login-in"><Wordmark />
      <form className="card" onSubmit={submit} noValidate><h1>Sign in to Maxen</h1>
        <div className="lf"><div><label htmlFor="l-email">Email</label><input id="l-email" type="email" defaultValue="design@email.com" autoComplete="username" /></div></div>
        <div className={`lf ${err ? 'err' : ''}`}><div><label htmlFor="l-pw">Password</label><input id="l-pw" type={show ? 'text' : 'password'} placeholder="Type any password" autoComplete="current-password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false); }} /></div>
          <button type="button" className="icon-btn" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}><Icon name="eye" size={22} /></button></div>
        {err && <div className="err-msg">Enter your password to sign in.</div>}
        <a className="forgot" href="#/login" onClick={(e) => { e.preventDefault(); toast('This is a demo: there are no real accounts'); }}>Forgot password?</a>
        <button className="btn btn-primary btn-lg" type="submit">Login</button>
      </form>
      <p className="proto-note">Portfolio demo: any password signs you in. All data is fictional and stays in your browser.</p>
    </div></main>
  );
}
