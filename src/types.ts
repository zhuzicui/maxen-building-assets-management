export type Status = 'Planned' | 'Ready' | 'In progress' | 'On hold' | 'Overdue' | 'Completed';
export const STATUSES: Status[] = ['Planned', 'Ready', 'In progress', 'On hold', 'Overdue', 'Completed'];
export type Priority = 'None' | 'Low' | 'Medium' | 'High';
export const PRIORITIES: Priority[] = ['None', 'Low', 'Medium', 'High'];

export interface Building {
  id: string;
  name: string;
  short: string;
  addr: string;
  area: string;
  year: string;
  photo?: string;
  desc: string;
  /** Each building has its own wings and floor counts. */
  wings: Wing[];
}

export interface Wing {
  name: string;
  floors: number;
  roof: boolean;
}

export interface Person {
  id: string;
  name: string;
  company: string;
  title: string;
  initials: string;
  phone: string;
  email: string;
  disc?: string;
  internal: boolean;
}

export interface Note {
  id: string;
  text: string;
  who: string;
  when: string; // ISO timestamp
  pinned?: boolean;
  imgs?: number;
}

export interface Doc {
  name: string;
  kind: 'Manual' | 'Warranty' | 'Drawing' | 'Report' | 'Invoice';
}

export interface Warranty {
  provider: string;
  start: string; // ISO date
  end: string; // ISO date
}

export interface Asset {
  id: string;
  buildingId: string;
  wing: string;
  floor: string;
  room: string;
  name: string;
  domain: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  description?: string;
  parentId?: string;
  specs: { name: string; value: string }[];
  docs: Doc[];
  warranty?: Warranty;
  notes: Note[];
  /** Checklist template titles that apply to this asset. */
  contactIds: string[];
  solar?: boolean;
  created?: boolean;
}

export interface ChecklistTask {
  id: string;
  text: string;
  unit?: string;
  done: boolean;
  reading?: string;
}
export interface ChecklistGroup {
  id: string;
  title: string;
  assetId?: string;
  tasks: ChecklistTask[];
}

export interface WorkOrder {
  id: string;
  buildingId: string;
  name: string;
  description: string;
  category: string;
  type: string;
  recurrence: string;
  duration: string;
  priority: Priority;
  status: Status;
  due: string; // ISO date
  assigneeId: string;
  supplier: string;
  assetIds: string[];
  groups: ChecklistGroup[];
  notes: Note[];
  french?: boolean;
  /** Completed orders only: hours it really took. */
  actualHours?: number;
  created?: boolean;
}
