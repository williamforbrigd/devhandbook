'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '../ui/Icon'
import { ThemeToggle } from './ThemeToggle'
import { HandbookSearchBar } from './search/HandbookSearchBar'

/**
 * Topbar that lives inside the .hb-pane (sticky at top: 0).
 * - Brand on the left (links to /)
 * - Persistent search in the middle, except on the landing page
 * - 3-state theme toggle on the right
 */
export function Header(): React.JSX.Element {
  const pathname = usePathname()
  const showSearch = pathname !== '/'

  return (
    <header className="hb-topbar">
      <Link href="/" className="hb-topbar__brand" aria-label="Hjem">
        <Icon name="bookOpen" size={16} />
        <span>Dev Handbook</span>
      </Link>

      <div className="hb-topbar__spacer" />

      {showSearch && <HandbookSearchBar variant="compact" />}

      <ThemeToggle />
    </header>
  )
}
