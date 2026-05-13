import React from 'react'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { Info, AlertTriangle, Lightbulb, AlertOctagon } from 'lucide-react'

// ── Variant config ────────────────────────────────────────────────────────────

type Variant = 'info' | 'warning' | 'tip' | 'deprecated'

interface VariantStyle {
  bg: string
  border: string
  text: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  label: string
}

const VARIANT_CONFIG: Record<Variant, VariantStyle> = {
  info: {
    bg: '#eff6ff',
    border: '#93c5fd',
    text: '#1e40af',
    Icon: Info,
    label: 'Note',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fcd34d',
    text: '#92400e',
    Icon: AlertTriangle,
    label: 'Warning',
  },
  tip: {
    bg: '#f0fdf4',
    border: '#86efac',
    text: '#166534',
    Icon: Lightbulb,
    label: 'Tip',
  },
  deprecated: {
    bg: '#fdf4ff',
    border: '#d8b4fe',
    text: '#6b21a8',
    Icon: AlertOctagon,
    label: 'Deprecated',
  },
}

const FALLBACK: VariantStyle = VARIANT_CONFIG.info

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
  const { Icon, bg, border, text, label } = config
  const title: string | null = value?.title ?? null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = value?.content ?? []

  return (
    <div
      role="note"
      aria-label={title ?? label}
      style={{
        margin: '1.25rem 0',
        borderLeft: `4px solid ${border}`,
        background: bg,
        borderRadius: '0 6px 6px 0',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px 6px',
          color: text,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <Icon size={15} strokeWidth={2.2} aria-hidden />
        {title ?? label}
      </div>

      {/* Body — nested PortableText */}
      {content.length > 0 && (
        <div
          style={{
            padding: '0 14px 10px',
            fontSize: 14,
            lineHeight: 1.6,
            color: text,
          }}
        >
          <PortableText value={content} components={nestedComponents} />
        </div>
      )}
    </div>
  )
}
