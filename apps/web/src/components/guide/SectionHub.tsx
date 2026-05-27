'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Icon } from '../ui/Icon'
import { ArticleCard } from '../article/ArticleCard'
import { MaturityBadge } from '../article/MaturityBadge'
import type { SectionData, ArticleListItem, SectionGuideListItem, Maturity } from '../../lib/queries'

interface ArticleCardItem {
  _id: string
  title: string
  slug: string
  summary: string | null
  maturity: Maturity
  expertises: { title: string; slug: string }[]
  date: string | null
  section: { title: string; slug: string }
}

interface Props {
  section: SectionData
  articles: ArticleListItem[]
  guides: SectionGuideListItem[]
  defaultTab?: 'articles' | 'guides'
}

export function SectionHub({ section, articles, guides, defaultTab = 'articles' }: Props): React.JSX.Element {
  const [tab, setTab] = useState<'articles' | 'guides'>(defaultTab)

  const articleCards: ArticleCardItem[] = articles.map((a) => ({
    _id: a._id,
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    maturity: a.maturity,
    expertises: a.expertises,
    date: a.lastVerifiedAt,
    section: { title: section.title, slug: section.slug },
  }))

  return (
    <div>
      {/* Hub header */}
      <div className="hb-hub__head">
        <div className="hb-hub__title">
          {section.icon && (
            <span className="hb-hub__title__icon">
              <Icon name={section.icon} size={22} />
            </span>
          )}
          <h1>{section.title}</h1>
        </div>
      </div>
      {section.description && (
        <p className="hb-hub__sub">{section.description}</p>
      )}

      {/* Tabs */}
      <div className="hb-hub__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'articles'}
          className={`hb-hub__tab${tab === 'articles' ? ' is-active' : ''}`}
          onClick={() => setTab('articles')}
        >
          <Icon name="fileText" size={13} />
          Artikler
          <span className="hb-hub__tab__count">{articles.length}</span>
        </button>
        {guides.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'guides'}
            className={`hb-hub__tab${tab === 'guides' ? ' is-active' : ''}`}
            onClick={() => setTab('guides')}
          >
            <Icon name="map" size={13} />
            Guides
            <span className="hb-hub__tab__count">{guides.length}</span>
          </button>
        )}
      </div>

      {/* Articles tab */}
      {tab === 'articles' && (
        <>
          {articleCards.length === 0 && (
            <p style={{ color: 'var(--hb-fg-muted)' }}>No articles yet.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {articleCards.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </>
      )}

      {/* Guides tab */}
      {tab === 'guides' && (
        <div className="hb-gindex__list">
          {guides.map((g) => (
            <Link
              key={g._id}
              href={`/guides/${g.slug}`}
              className="hb-gindex__row"
            >
              <div className="hb-gindex__row__main">
                <div className="hb-gindex__row__title">
                  {g.title}
                  {g.isLivingDocument && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--hb-accent)', verticalAlign: 'middle' }}>
                      Living doc
                    </span>
                  )}
                </div>
                {g.summary && (
                  <div className="hb-gindex__row__sub">{g.summary}</div>
                )}
                <div className="hb-gindex__row__chips">
                  {(g.roles ?? []).map((r) => (
                    <span key={r._id} className="hb-gcard__role">{r.title}</span>
                  ))}
                  <MaturityBadge maturity={g.maturity} />
                </div>
              </div>
              <div className="hb-gindex__row__meta">
                {(g.phases ?? []).length > 0 && (
                  <span>{(g.phases ?? []).length} {(g.phases ?? []).length === 1 ? 'fase' : 'faser'}</span>
                )}
                {(g.phases ?? []).map((p) => p.duration).filter(Boolean).slice(0, 1).map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
