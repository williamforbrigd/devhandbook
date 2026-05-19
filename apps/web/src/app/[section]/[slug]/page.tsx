import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchArticle, fetchAllArticleParams, fetchRelatedFallback } from '../../../lib/queries'
import type { RelatedArticle } from '../../../lib/queries'
import { articleToMarkdown } from '../../../lib/portableTextToMarkdown'
import { preprocessBody } from '../../../lib/preprocessBody'
import { ArticleBody } from '../../../components/article/ArticleBody'
import { extractTocItems, estimateReadingMinutes } from '../../../lib/toc'
import { MaturityBadge } from '../../../components/article/MaturityBadge'
import { ArticleBanner } from '../../../components/article/ArticleBanner'
import { CopyMarkdownButtons } from '../../../components/article/CopyMarkdownButtons'
import { RelatedSkillsSection } from '../../../components/article/RelatedSkillsSection'
import { ArticleCard } from '../../../components/article/ArticleCard'
import { TocRegistrar, TableOfContentsMobile } from '../../../components/layout/TocContext'
import { Pill } from '../../../components/ui/Pill'
import { Avatar, Avatars } from '../../../components/ui/Avatar'

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateFormatter.format(d)
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
  const readingMinutes = estimateReadingMinutes(article.body ?? [])
  const expertises = article.expertises ?? []
  const contributors = article.contributors ?? []

  const [body] = await Promise.all([
    preprocessBody(article.body ?? []),
  ])

  const markdown = articleToMarkdown(
    {
      title: article.title,
      slug: article.slug,
      section,
      maturity: article.maturity,
      lastVerifiedAt: article.lastVerifiedAt ?? null,
      expertises: expertises.map((e) => e.title),
    },
    article.body ?? [],
  )

  // ── Related articles: curated first, then fallback to fill up to 3 ─────
  const curated = article.relatedArticles ?? []
  let related: RelatedArticle[] = curated
  if (curated.length < 3) {
    const expertiseIds = expertises.map((e) => e._id)
    const fallback = await fetchRelatedFallback({
      currentId: article._id,
      section,
      expertiseIds,
      limit: 3,
    })
    const curatedIds = new Set(curated.map((r) => r._id))
    const extras = fallback.filter((r) => !curatedIds.has(r._id))
    related = [...curated, ...extras].slice(0, 3)
  }

  return (
    <article>
      <TocRegistrar items={tocItems} readingMinutes={readingMinutes} />

      {tocItems.length > 0 && (
        <div className="show-below-lg">
          <TableOfContentsMobile items={tocItems} />
        </div>
      )}

      {/* Metadata row */}
      <div className="hb-meta">
        <MaturityBadge maturity={article.maturity} />
        {expertises.map((e) => (
          <Pill key={e._id}>{e.title}</Pill>
        ))}
        {article.lastVerifiedAt && (
          <span className="hb-meta__txt">· Last verified {formatDate(article.lastVerifiedAt)}</span>
        )}
        <span style={{ flex: 1 }} />
        {contributors.length > 0 && (
          <Avatars title={`Skrevet av ${contributors.map((c) => c.name).join(', ')}`}>
            {contributors.map((c) => (
              <Avatar key={c._id} name={c.name} avatarUrl={c.avatarUrl} />
            ))}
          </Avatars>
        )}
      </div>

      {/* Title + actions */}
      <div className="hb-article__head">
        <h1>{article.title}</h1>
        <div className="hb-article__actions">
          <CopyMarkdownButtons markdown={markdown} path={`/${section}/${slug}`} />
        </div>
      </div>

      {article.summary && <p className="hb-article__lede">{article.summary}</p>}

      {/* Maturity banners */}
      {article.maturity === 'exploratory' && (
        <ArticleBanner kind="exploratory" />
      )}
      {article.maturity === 'deprecated' && (
        <ArticleBanner
          kind="deprecated"
          supersededBy={
            article.supersededBy
              ? { title: article.supersededBy.title, href: `/${article.supersededBy.section.slug}/${article.supersededBy.slug}` }
              : null
          }
        />
      )}

      {/* Body — dimmed for deprecated articles */}
      <div style={article.maturity === 'deprecated' ? { opacity: 0.55 } : undefined}>
        <ArticleBody body={body} />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--hb-border)' }}>
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Related articles</h2>
          <div className="hb-related-grid">
            {related.map((r) => (
              <ArticleCard key={r._id} article={r} />
            ))}
          </div>
        </section>
      )}

      <RelatedSkillsSection skills={article.relatedSkills ?? []} />
    </article>
  )
}
