'use client'

import Link from 'next/link'
import { useState } from 'react'

// Extract plain text from a Portable Text block array (for the tooltip body)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPlainText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter((b) => b?._type === 'block')
    .map((b) =>
      (b.children ?? [])
        .map((span: { text?: string }) => span.text ?? '')
        .join('')
    )
    .join(' ')
    .trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GlossaryRef({ value, children }: { value: any; children?: any }): React.JSX.Element {
  const [open, setOpen] = useState(false)

  const term = value?.term
  const slug = term?.slug as string | undefined
  const definition = extractPlainText(term?.definition ?? [])

  return (
    <span
      style={{ position: 'relative', display: 'inline' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger — dotted underline signals "term with definition" */}
      <span
        tabIndex={0}
        role="button"
        aria-describedby={open ? 'glossary-tooltip' : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          borderBottom: '1px dotted var(--color-text-muted)',
          cursor: 'help',
          color: 'inherit',
          outline: 'none',
        }}
      >
        {children}
      </span>

      {/* Hover-card */}
      {open && (
        <span
          id="glossary-tooltip"
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            width: 280,
            padding: '10px 14px',
            background: 'var(--color-surface, #fff)',
            border: '1px solid var(--color-border, #e0e0e0)',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--color-text)',
            whiteSpace: 'normal',
            textAlign: 'left',
            fontWeight: 400,
            pointerEvents: 'auto',
          }}
        >
          {/* Term label */}
          <span style={{ display: 'block', fontWeight: 600, marginBottom: definition ? 4 : 0 }}>
            {term?.term}
          </span>

          {/* Definition (plain text) */}
          {definition && (
            <span style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-muted)' }}>
              {definition}
            </span>
          )}

          {/* Link to /glossary#slug */}
          {slug && (
            <Link
              href={`/glossary#${slug}`}
              style={{ fontSize: 12, color: 'var(--color-link)', textDecoration: 'underline' }}
            >
              Se i ordlisten →
            </Link>
          )}
        </span>
      )}
    </span>
  )
}
