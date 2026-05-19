import Link from 'next/link'
import type React from 'react'
import type { HandbookSearchResult } from '../../../lib/search/handbookSearch'
import { Icon } from '../../ui/Icon'
import styles from './HandbookSearchPageContent.module.css'

const TYPE_LABELS: Record<HandbookSearchResult['type'], string> = {
  article: 'Article',
  guide: 'Guide',
  glossary: 'Glossary',
  principle: 'Principle',
  section: 'Section',
}

const TYPE_ICONS: Record<HandbookSearchResult['type'], string> = {
  article: 'fileText',
  guide: 'compass',
  glossary: 'bookOpen',
  principle: 'flag',
  section: 'folder',
}

export function HandbookSearchPageContent({
  query,
  results,
}: {
  query: string
  results: HandbookSearchResult[]
}): React.JSX.Element {
  const hasQuery = query.trim().length >= 2

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1>Søk</h1>
        <p>Finn artikler, guider, prinsipper, seksjoner og begreper i håndboken.</p>
      </div>

      <form className={styles.form} role="search" action="/search">
        <Icon name="search" size={16} />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Søk etter artikler, mønstre, beslutninger…"
          autoComplete="off"
        />
        <button type="submit">Søk</button>
      </form>

      {hasQuery && (
        <div className={styles.stats}>
          {results.length === 1
            ? '1 resultat'
            : `${results.length} resultater`} for “{query}”
        </div>
      )}

      {!hasQuery && (
        <div className={`hb-empty ${styles.empty}`}>
          <div className="hb-empty__icon"><Icon name="search" size={22} /></div>
          <div className="hb-empty__title">Skriv minst to tegn for å søke.</div>
          <div className="hb-empty__body">Søket dekker innhold, sammendrag, seksjoner og ordliste.</div>
        </div>
      )}

      {hasQuery && results.length === 0 && (
        <div className={`hb-empty ${styles.empty}`}>
          <div className="hb-empty__icon"><Icon name="filter" size={22} /></div>
          <div className="hb-empty__title">Ingen treff.</div>
          <div className="hb-empty__body">Prøv et annet begrep eller en bredere formulering.</div>
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((result) => {
            const description = result.description ?? result.matchText

            return (
              <Link key={result.id} href={result.href} className={styles.result}>
                <span className={styles.resultIcon}>
                  <Icon name={TYPE_ICONS[result.type]} size={18} />
                </span>
                <span className={styles.resultBody}>
                  <span className={styles.resultTitle}>{result.title}</span>
                  {description && <span className={styles.resultDesc}>{description}</span>}
                  <span className={styles.resultMeta}>
                    {TYPE_LABELS[result.type]}
                    {result.sectionTitle ? ` · ${result.sectionTitle}` : ''}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}