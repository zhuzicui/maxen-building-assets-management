import { useId } from 'react';
import { Icon } from './Icon';
import { toast } from '../ui';

interface Common { label: string; error?: string; hint?: string }
export function TextField({ label, value, onChange, error, type = 'text', placeholder, required }: Common & { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  const id = useId();
  return (
    <div><div className="ff" style={error ? { boxShadow: '0 0 0 2px var(--red)' } : undefined}><label htmlFor={id}>{label}{required ? ' *' : ''}</label><input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} /></div>{error && <div className="err-msg" style={{ margin: '4px 0 0' }}>{error}</div>}</div>
  );
}
export function TextArea({ label, value, onChange }: Common & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return <div className="ff"><label htmlFor={id}>{label}</label><textarea id={id} rows={3} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
export function SelectField({ label, value, onChange, options, error, required, sub }: Common & { value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; required?: boolean; sub?: boolean }) {
  const id = useId();
  return (
    <div><div className="ff" style={error ? { boxShadow: '0 0 0 2px var(--red)' } : undefined}><label htmlFor={id}>{label}{required ? ' *' : ''}</label>
      <div className="ind">{sub && <Icon name="sub" size={16} />}<select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error}>
        <option value="">Select…</option>{options.map((o) => { const v = typeof o === 'string' ? o : o.value, l = typeof o === 'string' ? o : o.label; return <option key={v} value={v}>{l}</option>; })}</select></div>
      <span className="sc"><Icon name="chev" size={18} /></span></div>{error && <div className="err-msg" style={{ margin: '4px 0 0' }}>{error}</div>}</div>
  );
}

export const UploadStub = () => (
  <div className="drop-zone" style={{ minHeight: 58 }} role="button" tabIndex={0} onClick={() => toast('File upload is not part of this demo')} onKeyDown={(e) => e.key === 'Enter' && toast('File upload is not part of this demo')}><Icon name="upload" size={26} />Upload file</div>
);

export function FormPage({ title, sections, onCancel, onSave, cta }: { title: string; sections: { id: string; nav: string; title: string; sub?: string; body: React.ReactNode }[]; onCancel: () => void; onSave: () => void; cta: string }) {
  return (
    <>
      <main className="page" style={{ paddingBottom: 24 }}>
        <div className="ph"><div><h1>{title}</h1></div></div>
        <div className="form-layout">
          <nav className="side-nav" aria-label="Form sections">{sections.map((s) => <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{s.nav}</a>)}</nav>
          <form onSubmit={(e) => { e.preventDefault(); onSave(); }} noValidate>{sections.map((s) => <section className="fsec" id={s.id} key={s.id}><h3>{s.title}</h3><p>{s.sub ?? ''}</p>{s.body}</section>)}</form>
          <div className="aside" />
        </div>
      </main>
      <div className="form-bar"><button className="btn btn-ghost-red" onClick={onCancel}>Don't save</button><button className="btn btn-primary btn-lg" onClick={onSave}>{cta}</button></div>
    </>
  );
}
