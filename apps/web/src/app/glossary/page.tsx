import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import { fetchGlossary } from '../../lib/queries'

export const metadata: Metadata = { title: 'Glossary' }

export default async function GlossaryPage(): Promise<React.JSX.Element> {
  const terms = await fetchGlossary()

  // Group alphabetically
  const byLetter = terms.reduce<Record<string, typeof terms>>((acc, t) => {
    const letter = t.term.charAt(0).toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter]!.push(t)
    return acc
  }, {})
  const letters = Object.keys(byLetter).sort()

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
        Glossary
      </h1>
      <p style={{ margin: '0 0 24px', color: 'var(--color-text-muted)', fontSize: 15 }}>
        Definitions of key terms used across the handbook.
      </p>

      {/* Letter jump links */}
      {letters.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 32 }}>
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} style={{ padding: '2px 8px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-link)', textDecoration: 'none', fontWeight: 600 }}>
              {l}
            </a>
          ))}
        </div>
      )}

      {terms.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No terms yet.</p>}

      {letters.map((letter) => (
        <section key={letter} id={`letter-${letter}`} style={{ marginBottom: 32, scrollMarginTop: 'calc(var(--header-height) + 16px)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 12px', paddingBottom: 8, borderBottom: '2px solid var(--color-border)' }}>
            {letter}
          </h2>
          <dl style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {byLetter[letter]!.map((term) => (
              <div key={term._id} id={term.slug} style={{ scrollMarginTop: 'calc(var(--header-height) + 16px)' }}>
                <dt style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                  {term.term}
                </dt>
                <dd style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {term.definition?.length > 0
                    ? <PortableText value={term.definition} />
                    : <span style={{ fontStyle: 'italic' }}>No definition yet.</span>
                  }
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
