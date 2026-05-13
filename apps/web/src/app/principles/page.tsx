import type { Metadata } from 'next'
import { fetchPrinciples } from '../../lib/queries'

export const metadata: Metadata = { title: 'Principles' }

export default async function PrinciplesPage(): Promise<React.JSX.Element> {
  const principles = await fetchPrinciples()

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
        Principles
      </h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 15 }}>
        The values and beliefs that guide our engineering decisions.
      </p>

      {principles.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No principles yet.</p>}

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {principles.map((p, i) => (
          <li
            key={p._id}
            id={p.slug}
            style={{
              display: 'flex',
              gap: 16,
              padding: '20px 24px',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              scrollMarginTop: 'calc(var(--header-height) + 16px)',
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-border)', minWidth: 28, paddingTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>
                {p.title}
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {p.statement}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
