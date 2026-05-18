import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { fetchAllSectionsWithCounts } from '../../lib/queries'
import { Icon } from '../../components/ui/Icon'
import { EmptyState } from '../../components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'Sections · Handbook',
  description: 'All sections of the developer handbook.',
}

function articleCount(n: number): string {
  return `${n} ${n === 1 ? 'artikkel' : 'artikler'}`
}

export default async function SectionsIndexPage(): Promise<React.JSX.Element> {
  const sections = await fetchAllSectionsWithCounts()

  return (
    <article>
      <header>
        <h1>Sections</h1>
        <p style={{ color: 'var(--hb-fg-2)', marginTop: 4 }}>
          Alle områder i håndboken. Velg en seksjon for å se artiklene den
          inneholder.
        </p>
      </header>

      {sections.length === 0 ? (
        <EmptyState
          icon="folder"
          title="Ingen seksjoner ennå."
          body="Når noen oppretter seksjoner i Sanity vil de dukke opp her."
        />
      ) : (
        <div className="hb-secgrid" style={{ marginTop: 24 }}>
          {sections.map((s) => (
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
              {s.description && (
                <div className="hb-seccard__desc">{s.description}</div>
              )}
              <div className="hb-seccard__foot">
                <span className="hb-seccard__meta">{articleCount(s.count)}</span>
                <span className="hb-seccard__open">
                  Åpne <Icon name="arrowUpRight" size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}
