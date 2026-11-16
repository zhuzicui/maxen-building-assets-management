import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/* ---------- toasts ---------- */
type Listener = (msg: string | null) => void;
const listeners = new Set<Listener>();
let timer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  listeners.forEach((l) => l(msg));
  clearTimeout(timer);
  timer = setTimeout(() => listeners.forEach((l) => l(null)), 2400);
}
export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { listeners.add(setMsg); return () => { listeners.delete(setMsg); }; }, []);
  return msg ? createPortal(<div className="toast" role="status">{msg}</div>, document.body) : null;
}

/* ---------- popover menu anchored to a button ---------- */
export function PopMenu({ anchor, onClose, align = 'left', children }: { anchor: HTMLElement | null; onClose: () => void; align?: 'left' | 'right'; children: React.ReactNode }) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!anchor || !el) return;
    const r = anchor.getBoundingClientRect(), w = el.offsetWidth;
    const left = align === 'right' ? Math.max(12, r.right - w) : Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
    setPos({ left, top: r.bottom + 8 });
  }, [anchor, el, align]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const down = (e: MouseEvent) => { const t = e.target as Node; if (el && !el.contains(t) && !anchor?.contains(t)) onClose(); };
    const scroll = () => onClose();
    document.addEventListener('keydown', key); document.addEventListener('mousedown', down); window.addEventListener('scroll', scroll, { passive: true });
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('mousedown', down); window.removeEventListener('scroll', scroll); };
  }, [el, anchor, onClose]);
  return createPortal(<div className="pop" role="menu" ref={setEl} style={{ left: pos?.left ?? -999, top: pos?.top ?? 0 }}>{children}</div>, document.body);
}

/* ---------- modal ---------- */
export function Modal({ onClose, labelledBy, children }: { onClose: () => void; labelledBy: string; children: React.ReactNode }) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onClose]);
  return createPortal(
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>{children}</div>
    </div>, document.body);
}

export function MenuItem({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button role="menuitem" className="mi" {...rest}>{children}</button>;
}
