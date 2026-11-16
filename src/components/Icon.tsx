import { ICONS } from './iconPaths';

export type IconName = keyof typeof ICONS | string;

export function Icon({ name, size = 18, className, style }: { name: IconName; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? '' }} />
  );
}
