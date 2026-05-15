'use client'

import React, { useState } from 'react'
import { Icon } from '../ui/Icon'
import { SearchDialog } from './SearchDialog'

interface SearchTriggerProps {
  /** Visual style: 'compact' fits in a topbar; 'wide' fills available width for a hero placement. */
  variant?: 'compact' | 'wide'
}

/**
 * Search trigger button. Opens the (stub) SearchDialog.
 * Used in the home-page hero. Can also be embedded elsewhere.
 */
export function SearchTrigger({ variant = 'compact' }: SearchTriggerProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const isWide = variant === 'wide'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Søk"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: isWide ? '12px 14px' : '6px 10px',
          border: '1px solid var(--hb-border)',
          borderRadius: isWide ? 10 : 8,
          background: 'var(--hb-bg-soft)',
          color: 'var(--hb-fg-3)',
          fontSize: isWide ? 14 : 13,
          cursor: 'pointer',
          width: isWide ? '100%' : undefined,
          minWidth: isWide ? undefined : 280,
        }}
      >
        <Icon name="search" size={isWide ? 16 : 14} />
        <span>Søk etter artikler, mønstre, beslutninger…</span>
        <kbd
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            padding: '1px 6px',
            borderRadius: 4,
            background: 'var(--hb-bg)',
            border: '1px solid var(--hb-border)',
            color: 'var(--hb-fg-3)',
            fontFamily: 'inherit',
          }}
        >
          ⌘K
        </kbd>
      </button>

      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
