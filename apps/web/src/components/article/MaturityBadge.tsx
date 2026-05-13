import type { Maturity } from '../../lib/queries'

export const MATURITY_CONFIG: Record<Maturity, { label: string; color: string; bg: string; dot: string }> = {
  established: { label: 'Established', color: '#166534', bg: '#dcfce7', dot: '#16a34a' },
  recommended: { label: 'Recommended', color: '#1e40af', bg: '#dbeafe', dot: '#2563eb' },
  exploratory: { label: 'Exploratory',  color: '#92400e', bg: '#fef3c7', dot: '#d97706' },
  deprecated:  { label: 'Deprecated',  color: '#991b1b', bg: '#fee2e2', dot: '#dc2626' },
}

export function MaturityBadge({ maturity }: { maturity: Maturity }): React.JSX.Element {
  const cfg = MATURITY_CONFIG[maturity] ?? MATURITY_CONFIG.recommended
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      background: cfg.bg,
      color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}
