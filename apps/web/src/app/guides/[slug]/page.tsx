import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchGuide, fetchAllGuideParams } from '../../../lib/queries'
import { guideToMarkdown } from '../../../lib/portableTextToMarkdown'
import { ArticleBody, extractTocItems } from '../../../components/article/ArticleBody'
import { MaturityBadge } from '../../../components/article/MaturityBadge'
import { CopyMarkdownButtons } from '../../../components/article/CopyMarkdownButtons'
import { RelatedSkillsSection } from '../../../components/article/RelatedSkillsSection'
import { TocRegistrar, TableOfContentsMobile } from '../../../components/layout/TocContext'

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return fetchAllGuideParams()
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = await fetchGuide(slug)
  if (!guide) return {}
  return { title: guide.title, description: guide.summary ?? undefined }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<React.JSX.Element> {
  const { slug } = await params
  const guide = await fetchGuide(slug)
  if (!guide) notFound()

  const tocItems = extractTocItems(guide.body)

  const markdown = guideToMarkdown(
    {
      title: guide.title,
      slug: guide.slug,
      maturity: guide.maturity,
      lastVerifiedAt: guide.lastVerifiedAt ?? null,
      expertises: (guide.expertises ?? []).map((e) => e.title),
      roles: (guide.roles ?? []).map((r) => r.title),
      isLivingDocument: guide.isLivingDocument ?? false,
      phases: (guide.phases ?? []).map((p) => ({ title: p.title, duration: p.duration ?? null })),
    },
    guide.body ?? [],
  )

  return (
    <article>
      {/* Register ToC items client-side for scroll-spy */}
      <TocRegistrar items={tocItems} />

      {/* Mobile ToC dropdown */}
      {tocItems.length > 0 && (
        <div className="show-below-lg">
          <TableOfContentsMobile items={tocItems} />
        </div>
      )}

      {/* Title + copy buttons */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <h1
          style={{
            flex: 1,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          {guide.title}
        </h1>
        <div style={{ flexShrink: 0, paddingTop: 6 }}>
          <CopyMarkdownButtons markdown={markdown} path={`/guides/${slug}`} />
        </div>
      </div>

      {/* Metadata row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 16,
          marginBottom: 24,
          borderBottom: '1px solid var(--color-border)',
          fontSize: 13,
        }}
      >
        <MaturityBadge maturity={guide.maturity} />

        {(guide.expertises ?? []).map((e) => (
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

        {(guide.roles ?? []).length > 0 && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1.5 10.5c0-2.21 2.015-4 4.5-4s4.5 1.79 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {guide.roles.map((r) => r.title).join(', ')}
          </span>
        )}

        {guide.lastVerifiedAt && (
          <span style={{ color: 'var(--color-text-muted)' }}>
            Verified{' '}
            {new Date(guide.lastVerifiedAt).toLocaleDateString('no-NO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}

        {/* Contributors */}
        {(guide.contributors ?? []).length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            {guide.contributors.map((c) => (
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

      {/* Living document banner */}
      {guide.isLivingDocument && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 24,
            padding: '12px 16px',
            background: 'color-mix(in srgb, var(--color-indigo, #6366f1) 8%, var(--color-bg))',
            border: '1px solid color-mix(in srgb, var(--color-indigo, #6366f1) 20%, transparent)',
            borderRadius: 8,
            fontSize: 13,
            color: 'color-mix(in srgb, var(--color-indigo, #6366f1) 70%, var(--color-text))',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M2 12.5V14h1.5l7-7L9 5.5l-7 7zM13.71 4.29a1 1 0 000-1.42l-1.08-1.08a1 1 0 00-1.42 0l-1.05 1.05 2.5 2.5 1.05-1.05z" fill="currentColor" />
          </svg>
          <span>
            <strong>Levende dokument.</strong> Denne guiden oppdateres etter hvert som mønsteret modnes.
            Bidra gjerne.
          </span>
        </div>
      )}

      {/* Phases nav */}
      {(guide.phases ?? []).length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 28,
            borderBottom: '1px solid var(--color-border)',
            overflowX: 'auto',
          }}
        >
          {guide.phases.map((phase, i) => (
            <a
              key={i}
              href={`#fase-${i + 1}`}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {i + 1}. {phase.title}
              {phase.duration && (
                <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 6, opacity: 0.7 }}>
                  {phase.duration}
                </span>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Body */}
      <ArticleBody body={guide.body ?? []} />

      {/* Related articles */}
      {(guide.relatedArticles ?? []).length > 0 && (
        <aside style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              marginBottom: 12,
            }}
          >
            Relaterte artikler
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {guide.relatedArticles.map((r) => (
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
      <RelatedSkillsSection skills={guide.relatedSkills ?? []} />
    </article>
  )
}
