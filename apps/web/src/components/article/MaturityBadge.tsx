import type { Maturity } from '../../lib/queries'

export const MATURITY_LABEL: Record<Maturity, string> = {
  established: 'Established',
  recommended: 'Recommended',
  exploratory: 'Exploratory',
  deprecated: 'Deprecated',
}

export function MaturityBadge({ maturity }: { maturity: Maturity }): React.JSX.Element {
  const label = MATURITY_LABEL[maturity] ?? MATURITY_LABEL.recommended
  return (
    <span className={`hb-badge hb-badge--${maturity}`}>
      <span className="hb-badge__dot" />
      {label}
    </span>
  )
}
