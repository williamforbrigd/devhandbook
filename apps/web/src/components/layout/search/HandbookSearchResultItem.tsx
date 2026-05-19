'use client'

import Link from 'next/link'
import type React from 'react'
import type { HandbookSearchResult } from '../../../lib/search/handbookSearch'
import { Icon } from '../../ui/Icon'
import styles from './HandbookSearch.module.css'

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

export function HandbookSearchResultItem({
  result,
  active,
  id,
  onClick,
  onMouseEnter,
}: {
  result: HandbookSearchResult
  active: boolean
  id: string
  onClick: () => void
  onMouseEnter: () => void
}): React.JSX.Element {
  const description = result.description ?? result.matchText

  return (
    <Link
      href={result.href}
      id={id}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      className={[styles.result, active ? styles.active : ''].filter(Boolean).join(' ')}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className={styles.resultIcon}>
        <Icon name={TYPE_ICONS[result.type]} size={16} />
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
}