'use client'

import type React from 'react'
import type { HandbookSearchResult } from '../../../lib/search/handbookSearch'
import { HandbookSearchResultItem } from './HandbookSearchResultItem'
import styles from './HandbookSearch.module.css'

export function HandbookSearchDropdown({
  query,
  results,
  loading,
  error,
  activeIndex,
  onResultClick,
  onActiveIndexChange,
  onViewAll,
}: {
  query: string
  results: HandbookSearchResult[]
  loading: boolean
  error: string | null
  activeIndex: number
  onResultClick: () => void
  onActiveIndexChange: (index: number) => void
  onViewAll: () => void
}): React.JSX.Element {
  const hasQuery = query.trim().length >= 2
  const showEmpty = hasQuery && !loading && !error && results.length === 0

  return (
    <div id="handbook-search-results" className={styles.dropdown} role="presentation">
      <div className={styles.dropdownInner}>
        {loading && <div className={styles.state}>Søker…</div>}
        {error && <div className={styles.state}>Kunne ikke søke akkurat nå.</div>}
        {showEmpty && <div className={styles.state}>Ingen treff.</div>}

        {results.length > 0 && (
          <div role="listbox" aria-label="Søkeresultater" className={styles.results}>
            {results.map((result, index) => (
              <HandbookSearchResultItem
                key={result.id}
                id={`handbook-search-result-${index}`}
                result={result}
                active={index === activeIndex}
                onClick={onResultClick}
                onMouseEnter={() => onActiveIndexChange(index)}
              />
            ))}
          </div>
        )}

        {hasQuery && (
          <button type="button" className={styles.viewAll} onMouseDown={(event) => event.preventDefault()} onClick={onViewAll}>
            Vis alle resultater for “{query.trim()}”
          </button>
        )}
      </div>
    </div>
  )
}