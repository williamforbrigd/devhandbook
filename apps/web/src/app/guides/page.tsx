import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchGuides } from '../../lib/queries'
import { MaturityBadge } from '../../components/article/MaturityBadge'

export const metadata: Metadata = { title: 'Guides' }

export default async function GuidesPage(): Promise<React.JSX.Element> {
  const guides = await fetchGuides()

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
        Guides
      </h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 15 }}>
        Step-by-step walkthroughs for common workflows.
      </p>

      {guides.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No guides yet.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {guides.map((guide) => (
          <Link
            key={guide._id}
            href={`/guides/${guide.slug}`}
            style={{
              display: 'block',
              padding: '16px 20px',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              textDecoration: 'none',
              background: 'var(--color-bg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: guide.summary ? 6 : 0 }}>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                {guide.title}
              </span>
              <MaturityBadge maturity={guide.maturity} />
            </div>
            {guide.summary && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                {guide.summary}
              </p>
            )}
            {(guide.expertises ?? []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {(guide.expertises ?? []).map((e) => (
                  <span key={e.slug} style={{ padding: '1px 7px', borderRadius: 99, fontSize: 11, border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    {e.title}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}