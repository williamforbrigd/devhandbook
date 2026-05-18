'use client'

import React, { useCallback, useState } from 'react'
import { Icon } from '../../components/ui/Icon'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * Alphabet jump nav — A–Z chips, disabled when no entries start with that
 * letter. Active letter (e.g. the first one with entries) is highlighted.
 */
export function AlphaNav({
  activeLetters,
  active,
}: {
  activeLetters: Set<string>
  active?: string
}): React.JSX.Element {
  return (
    <div className="hb-alpha">
      {ALPHABET.map((l) => {
        const enabled = activeLetters.has(l)
        const className = [
          'hb-alpha__letter',
          enabled ? '' : 'is-disabled',
          l === active ? 'is-active' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return enabled ? (
          <a key={l} href={`#letter-${l}`} className={className}>
            {l}
          </a>
        ) : (
          <span key={l} className={className} aria-disabled="true">
            {l}
          </span>
        )
      })}
    </div>
  )
}

/**
 * Copy a deep-link to a glossary entry. Writes `${window.location.origin}
 * ${pathname}#${slug}` to the clipboard.
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
      className="hb-gl__copylink"
      onClick={onClick}
      aria-label={copied ? 'Lenke kopiert' : 'Kopier lenke til oppslag'}
      title={copied ? 'Kopiert' : 'Kopier lenke'}
    >
      <Icon name={copied ? 'check' : 'link'} size={12} />
    </button>
  )
}
