import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchGuide, fetchAllGuideParams } from '../../../lib/queries'
import { guideToMarkdown } from '../../../lib/portableTextToMarkdown'
import { ArticleBody, extractTocItems } from '../../../components/article/ArticleBody'
import { MaturityBadge } from '../../../components/article/MaturityBadge'
import { CopyMarkdownButtons } from '../../../components/article/CopyMarkdownButtons'
import { RelatedSkillsSection } from '../../../components/article/RelatedSkillsSection'
import { TocRegistrar, TableOfContentsMobile } from '../../../components/layout/TocContext'
import { Pill } from '../../../components/ui/Pill'
import { Avatar, Avatars } from '../../../components/ui/Avatar'
import { Icon } from '../../../components/ui/Icon'
import { PhaseTimeline } from '../../../components/guide/PhaseTimeline'
import { LivingDocBanner } from '../../../components/guide/LivingDocBanner'
import { TemplateLink } from '../../../components/guide/TemplateLink'

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateFormatter.format(d)
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
  const expertises = guide.expertises ?? []
  const roles = guide.roles ?? []
  const contributors = guide.contributors ?? []
  const phases = guide.phases ?? []
  const artifacts = (guide.artifacts ?? []).filter((a) => a.url && a.label)
  const related = guide.relatedArticles ?? []

  const markdown = guideToMarkdown(
    {
      title: guide.title,
      slug: guide.slug,
      maturity: guide.maturity,
      lastVerifiedAt: guide.lastVerifiedAt ?? null,
      expertises: expertises.map((e) => e.title),
      roles: roles.map((r) => r.title),
      isLivingDocument: guide.isLivingDocument ?? false,
      phases: phases.map((p) => ({ title: p.title, duration: p.duration ?? null })),
    },
    guide.body ?? [],
  )

  return (
    <article>
      <TocRegistrar items={tocItems} />

      {tocItems.length > 0 && (
        <div className="show-below-lg">
          <TableOfContentsMobile items={tocItems} />
        </div>
      )}

      {/* Metadata row */}
      <div className="hb-meta">
        <MaturityBadge maturity={guide.maturity} />
        {expertises.map((e) => (
          <Pill key={e._id}>{e.title}</Pill>
        ))}
        {roles.length > 0 && (
          <span className="hb-meta__txt">
            <Icon
              name="clock"
              size={11}
              style={{ verticalAlign: '-1px', marginRight: 3 }}
            />
            roller: <strong>{roles.map((r) => r.title).join(', ')}</strong>
          </span>
        )}
        <span style={{ flex: 1 }} />
        {guide.lastVerifiedAt && (
          <span className="hb-meta__txt">Verified {formatDate(guide.lastVerifiedAt)}</span>
        )}
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
        <h1>{guide.title}</h1>
        <div className="hb-article__actions">
          <CopyMarkdownButtons markdown={markdown} path={`/guides/${slug}`} />
        </div>
      </div>

      {guide.summary && <p className="hb-article__lede">{guide.summary}</p>}

      {guide.isLivingDocument && <LivingDocBanner />}

      {phases.length > 0 && (
        <div style={{ margin: '24px 0 8px' }}>
          <PhaseTimeline
            phases={phases.map((p) => ({ label: p.title, duration: p.duration }))}
          />
        </div>
      )}

      {/* Deprecated notice */}
      {guide.maturity === 'deprecated' && (
        <div
          className="hb-callout hb-callout--deprecated"
          style={{ marginTop: 24 }}
          role="note"
        >
          <strong>This guide is deprecated.</strong>
        </div>
      )}

      {/* Body */}
      <ArticleBody body={guide.body ?? []} />

      {/* Templates / artifacts */}
      {artifacts.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 id="maler">Maler og ressurser</h2>
          <div className="hb-tmpls" style={{ marginTop: 16 }}>
            {artifacts.map((a, i) => (
              <TemplateLink
                key={`${a.url}-${i}`}
                href={a.url!}
                title={a.label!}
                icon={a.artifactType === 'externalLink' ? 'external' : 'fileText'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <aside style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--hb-border)' }}>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--hb-fg-muted)',
              marginBottom: 12,
            }}
          >
            Relaterte artikler
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {related.map((r) => (
              <Link
                key={r._id}
                href={`/${r.section.slug}/${r.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontSize: 14,
                  color: 'var(--hb-fg)',
                  textDecoration: 'none',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--hb-border)',
                  background: 'var(--hb-bg-soft)',
                }}
              >
                <span style={{ fontWeight: 500 }}>{r.title}</span>
                <MaturityBadge maturity={r.maturity} />
              </Link>
            ))}
          </div>
        </aside>
      )}

      <RelatedSkillsSection skills={guide.relatedSkills ?? []} />
    </article>
  )
}
