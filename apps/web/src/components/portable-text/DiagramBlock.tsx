'use client'

import dynamic from 'next/dynamic'

const MermaidDiagram = dynamic(
  () => import('./MermaidDiagram').then((m) => m.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-subtle, #f6f8fa)',
        borderRadius: 6,
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        fontSize: 13,
      }}>
        Laster diagram…
      </div>
    ),
  },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DiagramBlock({ value }: { value: any }): React.JSX.Element | null {
  // code field is a @sanity/code-input object: { _type: 'code', language: string, code: string }
  const raw = value?.code
  const code: string = (typeof raw === 'object' ? raw?.code : raw) ?? ''
  const caption: string | undefined = value?.caption

  if (!code.trim()) return null

  return (
    <figure style={{ margin: '1.5rem 0' }}>
      {/* Scrollable container */}
      <div style={{
        overflowX: 'auto',
        padding: '20px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
      }}>
        <MermaidDiagram code={code} />
      </div>

      {caption && (
        <figcaption style={{
          marginTop: 8,
          fontSize: 13,
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
