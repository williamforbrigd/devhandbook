import React from 'react'
import Link from 'next/link'
import type { Maturity } from '../../lib/queries'
import { MaturityBadge } from './MaturityBadge'

const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : dateFormatter.format(d)
}

export type ArticleCardData = {
  _id: string
  title: string
  slug: string
  summary?: string | null
  maturity?: Maturity
  section: { title?: string | null; slug: string } | null
  expertises?: { title: string; slug: string }[] | null
  date?: string | null
}

/**
 * `.hb-card` link tile used by the home page ("Recently updated") and article
 * page ("Related articles"). Shows section eyebrow, title, summary (2-line
 * clamp), expertise chips, maturity badge, and last-updated date.
 */
export function ArticleCard({ article }: { article: ArticleCardData }): React.JSX.Element {
  const sectionSlug = article.section?.slug
  const sectionTitle = article.section?.title ?? ''
  const expertises = article.expertises ?? []
  const href = sectionSlug ? `/${sectionSlug}/${article.slug}` : `/${article.slug}`
  return (
    <Link
      href={href}
      className="hb-card"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="hb-card__top">
        {sectionTitle && <span className="hb-card__section">{sectionTitle}</span>}
        {article.maturity && <MaturityBadge maturity={article.maturity} />}
      </div>
      <h3 className="hb-card__title">{article.title}</h3>
      {article.summary && <p className="hb-card__summary">{article.summary}</p>}
      <div className="hb-card__foot">
        <div className="hb-card__chips">
          {expertises.slice(0, 2).map((e) => (
            <span key={e.slug} className="hb-card__chip">{e.title}</span>
          ))}
        </div>
        {article.date && <span>{formatDate(article.date)}</span>}
      </div>
    </Link>
  )
}
