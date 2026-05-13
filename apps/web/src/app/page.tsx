import React from 'react'
import Link from 'next/link'

const SECTIONS = [
  { href: '/guides',     label: 'Guides',     description: 'Step-by-step walkthroughs' },
  { href: '/principles', label: 'Principles', description: 'Engineering values and beliefs' },
  { href: '/glossary',   label: 'Glossary',   description: 'Key terms defined' },
  { href: '/ai-skills',  label: 'AI Skills',  description: 'Prompts and workflows for AI' },
]

export default function Home(): React.JSX.Element {
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 12px', color: 'var(--color-text)', lineHeight: 1.15 }}>
        Developer Handbook
      </h1>
      <p style={{ margin: '0 0 40px', fontSize: 16, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
        The source of truth for how we build software — patterns, practices, and shared knowledge.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            style={{
              display: 'block',
              padding: '20px 24px',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              textDecoration: 'none',
              background: 'var(--color-bg-subtle)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {s.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
