import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { CodeBlock } from '../portable-text/CodeBlock'
import { CodeGroup } from '../portable-text/CodeGroup'
import { Callout } from '../portable-text/Callout'

// ── Heading with anchor ───────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function HeadingAnchor({ level, children }: { level: 2 | 3 | 4; children: React.ReactNode }) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4'
  const text = typeof children === 'string' ? children : ''
  const id = slugify(text)

  const sizes: Record<number, string> = { 2: '1.5rem', 3: '1.25rem', 4: '1.1rem' }
  const margins: Record<number, string> = { 2: '2rem 0 0.75rem', 3: '1.5rem 0 0.5rem', 4: '1.25rem 0 0.4rem' }

  return (
    <Tag
      id={id}
      style={{
        fontSize: sizes[level],
        fontWeight: 700,
        margin: margins[level],
        color: 'var(--color-text)',
        scrollMarginTop: 'calc(var(--header-height) + 16px)',
      }}
    >
      {children}
    </Tag>
  )
}

// ── Image / figure ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Figure({ value }: { value: any }) {
  const url = value?.asset?.url
  if (!url) return null
  return (
    <figure style={{ margin: '1.5rem 0', textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={value.alt ?? ''}
        style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--color-border)' }}
      />
      {value.caption && (
        <figcaption style={{ marginTop: 6, fontSize: 13, color: 'var(--color-text-muted)' }}>
          {value.caption}
        </figcaption>
      )}
    </figure>
  )
}

// ── Diagram (mermaid — render as code block for now, live preview in studio) ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DiagramBlock({ value }: { value: any }) {
  return (
    <div style={{ margin: '1.25rem 0', padding: '16px', background: 'var(--color-bg-subtle)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>Diagram (Mermaid)</div>
      <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {value?.code ?? ''}
      </pre>
    </div>
  )
}

// ── Table ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableBlock({ value }: { value: any }) {
  const rows: string[][] = value?.rows ?? []
  if (rows.length === 0) return null
  const [head, ...body] = rows
  if (!head) return null

  return (
    <div style={{ margin: '1.25rem 0', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {head.map((cell, i) => (
              <th key={i} style={{ padding: '8px 12px', textAlign: 'left', background: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)', fontWeight: 600 }}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Component map ─────────────────────────────────────────────────────────────

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <HeadingAnchor level={2}>{children}</HeadingAnchor>,
    h3: ({ children }) => <HeadingAnchor level={3}>{children}</HeadingAnchor>,
    h4: ({ children }) => <HeadingAnchor level={4}>{children}</HeadingAnchor>,
    normal: ({ children }) => (
      <p style={{ margin: '0 0 1rem', lineHeight: 1.75, color: 'var(--color-text)' }}>{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{
        margin: '1.25rem 0',
        paddingLeft: 16,
        borderLeft: '3px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        fontStyle: 'italic',
      }}>
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ margin: '0 0 1rem', paddingLeft: 24, lineHeight: 1.75 }}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol style={{ margin: '0 0 1rem', paddingLeft: 24, lineHeight: 1.75 }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
    number: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code style={{
        padding: '1px 5px',
        borderRadius: 4,
        fontSize: '0.875em',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {children}
      </code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href ?? '#'}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        style={{ color: 'var(--color-link)', textDecoration: 'underline' }}
      >
        {children}
      </a>
    ),
  },
  types: {
    'hb.codeBlock':       CodeBlock,
    'hb.codeGroup':       CodeGroup,
    'hb.callout':         Callout,
    'hb.figure':          Figure,
    'hb.diagramBlock':    DiagramBlock,
    'hb.hotspotFigure':   Figure,
    'hb.table':           TableBlock,
    image:                Figure,
  },
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticleBody({ body }: { body: any[] }): React.JSX.Element {
  return (
    <div style={{ maxWidth: '72ch' }}>
      <PortableText value={body} components={components} />
    </div>
  )
}

// ── ToC extraction from body ──────────────────────────────────────────────────

import type { TocItem } from '../layout/TocContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTocItems(body: any[]): TocItem[] {
  if (!Array.isArray(body)) return []
  const items: TocItem[] = []
  for (const block of body) {
    if (block._type !== 'block') continue
    if (block.style !== 'h2' && block.style !== 'h3') continue
    const text = (block.children ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => c.text ?? '')
      .join('')
    if (!text) continue
    items.push({ id: slugify(text), text, level: block.style === 'h2' ? 2 : 3 })
  }
  return items
}
