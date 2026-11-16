const AV: Record<string, [string, string]> = { HA: ['#22A06B', '#B5F5C8'], CC: ['#B76E00', '#FFE7B3'], JS: ['#454F5B', '#DFE3E8'] };
const PAL: [string, string][] = [['#078DEE', '#CAF6FF'], ['#22A06B', '#B5F5C8'], ['#B76E00', '#FFE7B3'], ['#7635DC', '#EBD6FD'], ['#B71D18', '#FFE9D5'], ['#006C9C', '#CAFDF5']];

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  const [a, b] = AV[initials] ?? PAL[[...initials].reduce((h, c) => h + c.charCodeAt(0), 0) % PAL.length];
  return <span className="avatar" style={{ width: size, height: size, background: b, color: a, fontSize: Math.round(size * 0.36) }}>{initials}</span>;
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="none" stroke="var(--brand)" strokeWidth="3.5" />
      <rect x="13" y="11.5" width="14" height="3.6" rx="1.2" fill="var(--brand-ink)" />
      <rect x="16" y="18.2" width="11" height="3.6" rx="1.2" fill="var(--brand-ink)" />
      <rect x="13" y="24.9" width="14" height="3.6" rx="1.2" fill="var(--brand-ink)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <svg width="206" height="36" viewBox="0 0 206 36" role="img" aria-label="Maxen">
      <g fontFamily="Public Sans, sans-serif" fontWeight="700" fontSize="38" letterSpacing="12">
        <text x="0" y="33" style={{ fill: 'var(--brand-ink)' }}>MAX</text>
        <text x="158" y="33" style={{ fill: 'var(--brand-ink)' }}>N</text>
      </g>
      <g fill="var(--brand)"><rect x="124" y="5" width="22" height="5.5" rx="1" /><rect x="129" y="15.5" width="17" height="5.5" rx="1" /><rect x="124" y="26" width="22" height="5.5" rx="1" /></g>
    </svg>
  );
}
