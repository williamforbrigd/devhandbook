'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '../ui/Icon'

/**
 * Breadcrumb derived from pathname. Renders nothing on the home page.
 * Each segment becomes a crumb; the last is treated as current.
 *
 * Segment labels are derived from the slug (replace '-' with space, capitalise).
 * Pages that need richer labels (e.g. real article title) can render their own
 * crumb. This is a sensible default for the app shell.
 */
export function Breadcrumb(): React.JSX.Element | null {
  const pathname = usePathname()
  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    const label = humanise(seg)
    return { href, label }
  })

  return (
    <nav className="hb-crumb hb-crumb--bar" aria-label="Breadcrumb">
      <Link href="/" className="hb-crumb__home" aria-label="Home">
        <Icon name="home" size={16} />
      </Link>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <React.Fragment key={c.href}>
            <span className="hb-crumb__sep">
              <Icon name="chevronRight" size={14} />
            </span>
            {isLast ? (
              <span className="hb-crumb__step is-current">
                <span className="hb-crumb__dot" />
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="hb-crumb__step">
                <span className="hb-crumb__dot" />
                {c.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

function humanise(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
