import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchArticle, fetchAllArticleParams, fetchRelatedFallback } from '../../../lib/queries'
import type { RelatedArticle } from '../../../lib/queries'
import { ArticleBody, extractTocItems } from '../../../components/article/ArticleBody'
import { MaturityBadge } from '../../../components/article/MaturityBadge'
import { RelatedSkillsSection } from '../../../components/article/RelatedSkillsSection'
import { TocRegistrar, TableOfContentsMobile } from '../../../components/layout/TocContext'

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return fetchAllArticleParams()
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>
}): Promise<Metadata> {
  const { section, slug } = await params
  const article = await fetchArticle(section, slug)
  if (!article) return {}
  return { title: article.title, description: article.summary ?? undefined }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>
}): Promise<React.JSX.Element> {
  const { section, slug } = await params
  const article = await fetchArticle(section, slug)
  if (!article) notFound()

  const tocItems = extractTocItems(article.body)

  // ── Related articles: curated first, then fallback to fill up to 4 ──────────
  const curated = article.relatedArticles ?? []
  let related: RelatedArticle[] = curated
  if (curated.length < 4) {
    const expertiseIds = (article.expertises ?? []).map((e) => e._id)
    const fallback = await fetchRelatedFallback({
      currentId: article._id,
      section,
      expertiseIds,
      limit: 4,
    })
    const curatedIds = new Set(curated.map((r) => r._id))
    const extras = fallback.filter((r) => !curatedIds.has(r._id))
    related = [...curated, ...extras].slice(0, 4)
  }

  return (
    <article>
      {/* Register ToC items client-side for scroll-spy */}
      <TocRegistrar items={tocItems} />

      {/* Mobile ToC dropdown (shown below lg) */}
      {tocItems.length > 0 && (
        <div className="show-below-lg">
          <TableOfContentsMobile items={tocItems} />
        </div>
      )}

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        fontWeight: 800,
        lineHeight: 1.2,
        color: 'var(--color-text)',
        margin: '0 0 12px',
      }}>
        {article.title}
      </h1>

      {/* Metadata row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 16,
        marginBottom: 24,
        borderBottom: '1px solid var(--color-border)',
        fontSize: 13,
      }}>
        <MaturityBadge maturity={article.maturity} />

        {(article.expertises ?? []).map((e) => (
          <span
            key={e._id}
            style={{
              padding: '2px 8px',
              borderRadius: 99,
              fontSize: 11,
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {e.title}
          </span>
        ))}

        {article.lastVerifiedAt && (
          <span style={{ color: 'var(--color-text-muted)', marginLeft: 4 }}>
            Verified{' '}
            {new Date(article.lastVerifiedAt).toLocaleDateString('no-NO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}

        {/* Contributors */}
        {(article.contributors ?? []).length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            {(article.contributors ?? []).map((c) => (
              <span
                key={c._id}
                title={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--color-bg)',
                  boxShadow: '0 0 0 1px var(--color-border)',
                  background: 'var(--color-surface)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  flexShrink: 0,
                }}
              >
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatarUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  c.name.charAt(0).toUpperCase()
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Deprecated notice */}
      {article.maturity === 'deprecated' && (
        <div style={{
          marginBottom: 24,
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 8,
          fontSize: 14,
          color: '#991b1b',
        }}>
          <strong>This article is deprecated.</strong>
          {article.supersededBy && (
            <>
              {' '}See{' '}
              <a
                href={`/${article.supersededBy.section.slug}/${article.supersededBy.slug}`}
                style={{ color: '#991b1b', fontWeight: 600 }}
              >
                {article.supersededBy.title}
              </a>{' '}
              instead.
            </>
          )}
        </div>
      )}

      {/* Body */}
      <ArticleBody body={article.body ?? []} />

      {/* Related articles */}
      {related.length > 0 && (
        <aside style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Related
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {related.map((r) => (
              <a
                key={r._id}
                href={`/${r.section.slug}/${r.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 14,
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  transition: 'border-color 0.1s',
                }}
              >
                <span style={{ fontWeight: 500 }}>{r.title}</span>
                <MaturityBadge maturity={r.maturity} />
              </a>
            ))}
          </div>
        </aside>
      )}

      {/* Related AI Skills */}
      <RelatedSkillsSection skills={article.relatedSkills ?? []}/>
    </article>
  )
}
