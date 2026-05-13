'use client'

import { useEffect, useRef, useState } from 'react'

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (items.length === 0) return

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          // Pick topmost visible heading
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          )
          setActiveId(topmost.target.id)
        }
      },
      { rootMargin: '-56px 0px -60% 0px', threshold: 0 },
    )

    headings.forEach((el) => observerRef.current?.observe(el))
    return () => observerRef.current?.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 8 }}>
        On this page
      </div>
      {items.map((item) => {
        const isActive = activeId === item.id
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            style={{
              display: 'block',
              paddingLeft: item.level === 3 ? 12 : 0,
              padding: `3px 0 3px ${item.level === 3 ? 12 : 0}px`,
              fontSize: 12,
              lineHeight: 1.5,
              color: isActive ? '#1d4ed8' : '#6b7280',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              borderLeft: `2px solid ${isActive ? '#1d4ed8' : 'transparent'}`,
              transition: 'color 0.1s, border-color 0.1s',
            }}
          >
            {item.text}
          </a>
        )
      })}
    </nav>
  )
}

// ── Mobile ToC dropdown ───────────────────────────────────────────────────────

export function TableOfContentsMobile({ items }: { items: TocItem[] }) {
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
