import React from 'react'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { Icon } from '../ui/Icon'

// ── Variant config ────────────────────────────────────────────────────────────

type Variant = 'info' | 'warning' | 'tip' | 'deprecated'

const VARIANT_CONFIG: Record<Variant, { icon: string; label: string }> = {
  info:       { icon: 'info',          label: 'Note' },
  warning:    { icon: 'alertTriangle', label: 'Warning' },
  tip:        { icon: 'lightbulb',     label: 'Tips' },
  deprecated: { icon: 'clock',         label: 'Deprecated' },
}

const FALLBACK = VARIANT_CONFIG.info

// ── Minimal nested PortableText components (avoids importing the full ArticleBody) ──

const nestedComponents: PortableTextComponents = {
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.9em', padding: '1px 4px', borderRadius: 3, background: 'rgba(0,0,0,0.08)' }}>
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
        {children}
      </a>
    ),
  },
  block: {
    normal: ({ children }) => <p style={{ margin: '0 0 0.5em' }}>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul style={{ margin: '0.5em 0', paddingLeft: 20 }}>{children}</ul>,
    number: ({ children }) => <ol style={{ margin: '0.5em 0', paddingLeft: 20 }}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Callout({ value }: { value: any }): React.JSX.Element | null {
  const variant = (value?.variant ?? 'info') as Variant
  const config = VARIANT_CONFIG[variant] ?? FALLBACK
  const title: string | null = value?.title ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = value?.content ?? []

  return (
    <div
      role="note"
      aria-label={title ?? config.label}
      className={`hb-callout hb-callout--${variant}`}
      style={{ margin: '1.25rem 0' }}
    >
      <div className="hb-callout__icon" aria-hidden="true">
        <Icon name={config.icon} size={16} />
      </div>

      <div className="hb-callout__title">{title ?? config.label}</div>

      {content.length > 0 && (
        <div className="hb-callout__body">
          <PortableText value={content} components={nestedComponents} />
        </div>
      )}
    </div>
  )
}
