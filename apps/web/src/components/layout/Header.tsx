'use client'

import React from 'react'
import Link from 'next/link'
import { Icon } from '../ui/Icon'
import { ThemeToggle } from './ThemeToggle'

/**
 * Topbar that lives inside the .hb-pane (sticky at top: 0).
 * - Brand on the left (links to /)
 * - 3-state theme toggle on the right
 *
 * The search trigger lives on the home page (and can be embedded elsewhere)
 * via <SearchTrigger />.
 */
export function Header(): React.JSX.Element {
  return (
    <header className="hb-topbar">
      <Link href="/" className="hb-topbar__brand" aria-label="Hjem">
        <Icon name="bookOpen" size={16} />
        <span>Dev Handbook</span>
      </Link>

      <div className="hb-topbar__spacer" />

      <ThemeToggle />
    </header>
  )
}
