export const DURATIONS = ['1 hour', '2 hours', '3 hours', '4 hours', '1 day', '2 days'];
/** "4 hours" -> 4, "2 days" -> 16 (8-hour working days). */
export const durationHours = (d: string): number => {
  const n = parseInt(d, 10) || 1;
  return /day/.test(d) ? n * 8 : n;
};
