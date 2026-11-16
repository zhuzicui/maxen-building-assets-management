import type { Status } from '../types';

export const STATUS_CLASS: Record<Status, string> = { Planned: 'c-grey', Ready: 'c-grey', 'In progress': 'c-blue', 'On hold': 'c-amber', Overdue: 'c-red', Completed: 'c-green' };
export const STATUS_DOT: Record<string, string> = { Overdue: 'var(--red)', Completed: 'var(--green)', 'In progress': 'var(--brand)', 'On hold': 'var(--amber)', Ready: 'var(--grey-dot)', Planned: 'var(--grey-dot)' };
export const stSlug = (s: string) => s.toLowerCase().replace(/ /g, '-');

export const Chip = ({ status }: { status: Status }) => <span className={`chip ${STATUS_CLASS[status] ?? 'c-grey'}`}>{status}</span>;
