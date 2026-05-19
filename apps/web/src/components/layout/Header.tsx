'use client'

import React from 'react'
import Link from 'next/link'
import { Icon } from '../ui/Icon'
import { ThemeToggle } from './ThemeToggle'
import { SearchTrigger } from './SearchTrigger'

/**
 * Topbar that lives inside the .hb-pane (sticky at top: 0).
 * - Brand on the left (links to /)
 * - Persistent search trigger in the middle (opens the search dialog)
 * - 3-state theme toggle on the right
 */
export function Header(): React.JSX.Element {
  return (
    <header className="hb-topbar">
      <Link href="/" className="hb-topbar__brand" aria-label="Hjem">
        <Icon name="bookOpen" size={16} />
        <span>Dev Handbook</span>
      </Link>

      <div className="hb-topbar__spacer" />

      <SearchTrigger variant="compact" />

      <ThemeToggle />
    </header>
  )
}
