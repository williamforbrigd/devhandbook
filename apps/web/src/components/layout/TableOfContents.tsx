'use client'

import { useEffect, useState } from 'react'

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

export function TableOfContents({ items, readingMinutes = 0 }: { items: TocItem[]; readingMinutes?: number }): React.JSX.Element | null {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return

    // Approx. sticky header height — headings crossing this threshold are "active".
    const HEADER_OFFSET = 80

    const onScroll = () => {
      // Walk headings in order; the last one whose top is at or above
      // HEADER_OFFSET is the one the reader is currently in.
      let currentId = items[0]?.id ?? ''
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= HEADER_OFFSET) {
          currentId = item.id
        }
      }
      setActiveId(currentId)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // set initial active on mount
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page">
      <p className="hb-toc__title">On this page</p>
      <div className="hb-toc__list">
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={`hb-toc__item h${item.level}${isActive ? ' is-active' : ''}`}
            >
              {item.text}
            </a>
          )
        })}
      </div>

      {readingMinutes > 0 && (
        <>
          <hr className="hb-toc__divider" />
          <p className="hb-toc__meta">
            Lesetid: ~{readingMinutes} {readingMinutes === 1 ? 'minutt' : 'minutter'}
          </p>
        </>
      )}
    </nav>
  )
}

// ── Mobile ToC dropdown ───────────────────────────────────────────────────────

export function TableOfContentsMobile({ items }: { items: TocItem[] }): React.JSX.Element | null {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: 6,
          background: 'var(--color-surface, #f9fafb)',
          fontSize: 13,
          cursor: 'pointer',
          color: 'var(--color-text, #374151)',
        }}
      >
        <span style={{ fontSize: 12 }}>≡</span> On this page
        <span style={{ fontSize: 10, marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 10, marginTop: 4,
            background: 'var(--color-bg, #fff)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 8,
            padding: '8px 0',
            minWidth: 220,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          }}
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: `5px ${item.level === 3 ? 24 : 12}px`,
                fontSize: 13,
                color: 'var(--color-text, #374151)',
                textDecoration: 'none',
              }}
            >
              {item.text}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
