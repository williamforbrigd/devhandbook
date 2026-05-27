import Link from 'next/link'
import type { MethodListItem } from '../../lib/queries'
import { Pill } from '../ui/Pill'

const METHOD_TYPE_LABEL: Record<string, string> = {
  method: 'Method',
  practice: 'Practice',
}

export function MethodTypeBadge({ type }: { type: string }): React.JSX.Element {
  return <span className={`hb-method-type hb-method-type--${type}`}>{METHOD_TYPE_LABEL[type] ?? type}</span>
}

export function MethodCard({
  method,
  showDomain = false,
}: {
  method: MethodListItem
  showDomain?: boolean
}): React.JSX.Element {
  return (
    <Link href={`/methods/${method.domain.slug}/${method.slug}`} className="hb-method-card">
      <div className="hb-method-card__top">
        <MethodTypeBadge type={method.type} />
        {showDomain && <span className="hb-method-card__domain">{method.domain.title}</span>}
      </div>
      <h3 className="hb-method-card__title">{method.title}</h3>
      {method.summary && <p className="hb-method-card__summary">{method.summary}</p>}
      {(method.expertises ?? []).length > 0 && (
        <div className="hb-method-card__chips">
          {method.expertises.slice(0, 3).map((expertise) => (
            <Pill key={expertise.slug}>{expertise.title}</Pill>
          ))}
        </div>
      )}
    </Link>
  )
}