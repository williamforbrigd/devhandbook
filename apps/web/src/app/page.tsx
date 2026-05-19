import React from 'react'
import Link from 'next/link'
import { fetchAllSectionsWithCounts, fetchRecentArticles } from '../lib/queries'
import { SearchTrigger } from '../components/layout/SearchTrigger'
import { Icon } from '../components/ui/Icon'
import { ArticleCard } from '../components/article/ArticleCard'
import { APP_VERSION_LABEL } from '../lib/version'

function articleCount(n: number): string {
  return `${n} ${n === 1 ? 'artikkel' : 'artikler'}`
}

export default async function Home(): Promise<React.JSX.Element> {
  const [sections, recent] = await Promise.all([
    fetchAllSectionsWithCounts(),
    fetchRecentArticles(4),
  ])

  return (
    <>
      {/* Hero */}
      <section className="hb-hero">
        <div className="hb-hero__eyebrow">Handbook · {APP_VERSION_LABEL}</div>
        <h1>
          Best practices,
          <br />
          med kilde i kode.
        </h1>
        <p className="hb-hero__lede">
          Mønstre, beslutninger og felles ground truth for utviklerne i Acme.
          Skrevet av folkene som faktisk har kjørt det i prod.
        </p>
        <div style={{ marginTop: 16 }}>
          <SearchTrigger variant="wide" />
        </div>
      </section>

      {/* Browse by area */}
      {sections.length > 0 && (
        <>
          <div className="hb-sectitle">
            <h2>Browse by area</h2>
            <Link href="/sections">All sections →</Link>
          </div>
          <div className="hb-secgrid">
            {sections.map((s) => {
              return (
                <Link
                  key={s._id}
                  href={`/${s.slug}`}
                  className="hb-seccard"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <span className="hb-seccard__icon">
                    <Icon name={s.icon ?? 'folder'} size={20} />
                  </span>
                  <div className="hb-seccard__title">{s.title}</div>
                  {s.description && <div className="hb-seccard__desc">{s.description}</div>}
                  <div className="hb-seccard__foot">
                    <span className="hb-seccard__meta">{articleCount(s.count)}</span>
                    <span className="hb-seccard__open">
                      Åpne <Icon name="arrowUpRight" size={12} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* Recently updated */}
      {recent.length > 0 && (
        <>
          <div className="hb-sectitle" style={{ marginTop: 32 }}>
            <h2>Recently updated</h2>
          </div>
          <div className="hb-related-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {recent.map((r) => (
              <ArticleCard key={r._id} article={r} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
