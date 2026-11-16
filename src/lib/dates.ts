/** Dates are stored as ISO strings (YYYY-MM-DD) and compared as strings. */
export const iso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const parse = (s: string): Date => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayIso = (): string => iso(new Date());

export const addDays = (s: string, n: number): string => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const fmt = (s: string): string =>
  parse(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const fmtTs = (ts: string): string => {
  const mins = (Date.now() - new Date(ts).getTime()) / 60000;
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${Math.floor(mins)} min ago`;
  return fmt(ts.slice(0, 10));
};

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));
