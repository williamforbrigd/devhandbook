import Link from 'next/link'
import { MaturityBadge } from './MaturityBadge'
import type { ArticleListItem } from '../../lib/queries'

export function ArticleCard({ article, section }: { article: ArticleListItem; section: string }): React.JSX.Element {
  const href = `/${section}/${article.slug}`
  const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180
  const isStale =
    !article.lastVerifiedAt ||
    Date.now() - new Date(article.lastVerifiedAt).getTime() > SIX_MONTHS

  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '16px 20px',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        textDecoration: 'none',
        background: 'var(--color-bg)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: article.summary ? 6 : 0 }}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.4 }}>
          {article.title}
        </span>
        <MaturityBadge maturity={article.maturity} />
        {isStale && article.maturity !== 'deprecated' && (
          <span title="Not verified in 6+ months" style={{ fontSize: 11, color: '#d97706', whiteSpace: 'nowrap' }}>
            ⚠ Stale
          </span>
        )}
      </div>

      {article.summary && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {article.summary}
        </p>
      )}

      {(article.expertises ?? []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {(article.expertises ?? []).map((e) => (
            <span
              key={e.slug}
              style={{
                padding: '1px 7px',
                borderRadius: 99,
                fontSize: 11,
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              {e.title}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
