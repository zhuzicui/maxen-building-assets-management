/** Seeded random numbers so generated data is identical on every load. */
export const MOCK_SEED = 'maxen-2022';

export const hashStr = (s: string): number => {
  let h = 2166136261;
  for (const c of String(s)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export type Rng = () => number;

export const rng = (key: string): Rng => {
  let a = hashStr(MOCK_SEED + '|' + key);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const pick = <T,>(r: Rng, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];

export const shuffle = <T,>(r: Rng, arr: readonly T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
