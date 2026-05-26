import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchDomains } from '../../lib/queries'
import { Icon } from '../../components/ui/Icon'

export const metadata: Metadata = { title: 'Methods' }

export default async function MethodsPage(): Promise<React.JSX.Element> {
  const domains = await fetchDomains()

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
        Methods
      </h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 15 }}>
        Methods and practices grouped by domain.
      </p>

      {domains.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No domains yet.</p>}

      <div className="hb-method-domain-grid">
        {domains.map((domain) => (
          <Link key={domain._id} href={`/methods/${domain.slug}`} className="hb-method-domain-card">
            <span className="hb-method-domain-card__icon" style={domain.color ? { color: domain.color } : undefined}>
              <Icon name={domain.icon ?? 'compass'} size={18} />
            </span>
            <span className="hb-method-domain-card__body">
              <span className="hb-method-domain-card__title">{domain.title}</span>
              {domain.description && <span className="hb-method-domain-card__description">{domain.description}</span>}
              <span className="hb-method-domain-card__count">
                {domain.methodCount} {domain.methodCount === 1 ? 'method' : 'methods'}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}