'use client'

import React, { useCallback, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import styles from './glossary.module.css'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ'.split('')

/**
 * Alphabet jump nav — A–Z chips, disabled when no entries start with that
 * letter. Active letter (e.g. the first one with entries) is highlighted.
 */
export function AlphaNav({
  activeLetters,
  active,
}: {
  activeLetters: string[]
  active?: string
}): React.JSX.Element {
  const activeLetterSet = new Set(activeLetters)
  const [selectedLetter, setSelectedLetter] = useState(active)

  return (
    <nav className={styles.alpha} aria-label="Glossary alphabet navigation">
      {ALPHABET.map((l) => {
        const enabled = activeLetterSet.has(l)
        const className = [
          styles.alphaLetter,
          enabled ? '' : styles.disabled,
          l === selectedLetter ? styles.active : '',
        ]
          .filter(Boolean)
          .join(' ')

        return enabled ? (
          <a
            key={l}
            href={`#letter-${l}`}
            className={className}
            onClick={() => setSelectedLetter(l)}
          >
            {l}
          </a>
        ) : (
          <span key={l} className={className} aria-disabled="true">
            {l}
          </span>
        )
      })}
    </nav>
  )
}

/**
 * Copy a deep-link to a glossary entry.
 */
export function CopyEntryLink({ slug }: { slug: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const onClick = useCallback(async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${slug}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Ignore — clipboard may be blocked
    }
  }, [slug])

  return (
    <button
      type="button"
      className={styles.copyLink}
      onClick={onClick}
      aria-label={copied ? 'Lenke kopiert' : 'Kopier lenke til oppslag'}
      title={copied ? 'Kopiert' : 'Kopier lenke'}
    >
      <Icon name={copied ? 'check' : 'link'} size={12} />
    </button>
  )
}
