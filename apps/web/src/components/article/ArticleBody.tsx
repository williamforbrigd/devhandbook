'use client'

import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { CodeBlock } from '../portable-text/CodeBlock'
import { CodeGroup } from '../portable-text/CodeGroup'
import { Callout } from '../portable-text/Callout'
import { DecisionRecord } from '../portable-text/DecisionRecord'
import { InternalLink } from '../portable-text/InternalLink'
import { GlossaryRef } from '../portable-text/GlossaryRef'
import { Embed } from '../portable-text/Embed'
import { SkillEmbed } from '../portable-text/SkillEmbed'
import { SkillRef } from '../portable-text/SkillRef'
import { DiagramBlock } from '../portable-text/DiagramBlock'
import { HotspotFigure } from '../portable-text/HotspotFigure'
import { ConceptModel } from '../portable-text/ConceptModel'
import { Checklist } from '../portable-text/Checklist'
import { StepList } from '../portable-text/StepList'

// ── Heading with anchor ───────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Extract plain text from a raw Sanity block's children spans
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blockText(value: any): string {
  return (value?.children ?? []).map((s: { text?: string }) => s.text ?? '').join('')
}

function HeadingAnchor({ level, children, value }: { level: 2 | 3 | 4; children: React.ReactNode; value: any }) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4'
  const id = slugify(blockText(value))
  return <Tag id={id}>{children}</Tag>
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
    h2: ({ children, value }) => <HeadingAnchor level={2} value={value}>{children}</HeadingAnchor>,
    h3: ({ children, value }) => <HeadingAnchor level={3} value={value}>{children}</HeadingAnchor>,
    h4: ({ children, value }) => <HeadingAnchor level={4} value={value}>{children}</HeadingAnchor>,
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
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
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
    externalLink: ({ value, children }) => (
      <a
        href={value?.url ?? '#'}
        target={value?.newTab !== false ? '_blank' : undefined}
        rel="noopener noreferrer"
        style={{ color: 'var(--color-link)', textDecoration: 'underline' }}
      >
        {children}
      </a>
    ),
    internalLink: ({ value, children }) => (
      <InternalLink value={value}>{children}</InternalLink>
    ),
    glossaryRef: ({ value, children }) => (
      <GlossaryRef value={value}>{children}</GlossaryRef>
    ),
    skillRef: ({ value, children }) => (
      <SkillRef value={value}>{children}</SkillRef>
    ),
  },
  types: {
    'hb.embed':           Embed,
    'hb.skillEmbed':      SkillEmbed,
    'hb.codeBlock':       CodeBlock,
    'hb.codeGroup':       CodeGroup,
    'hb.callout':         Callout,
    'hb.decisionRecord':  DecisionRecord,
    'hb.figure':          Figure,
    'hb.diagramBlock':    DiagramBlock,
    'hb.hotspotFigure':   HotspotFigure,
    'hb.conceptModel':    ConceptModel,
    'hb.checklist':       Checklist,
    'hb.stepList':        StepList,
    'hb.table':           TableBlock,
    image:                Figure,
  },
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticleBody({ body }: { body: any[] }): React.JSX.Element {
  return (
    <div className="prose">
      <PortableText value={body} components={components} />
    </div>
  )
}

