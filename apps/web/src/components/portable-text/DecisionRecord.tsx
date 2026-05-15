import React from 'react'

interface Section {
  label: string
  content: string | null
}

function RecordSection({ label, content }: Section): React.JSX.Element | null {
  if (!content) return null
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
        {content}
      </p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DecisionRecord({ value }: { value: any }): React.JSX.Element {
  const context: string | null = value?.context ?? null
  const decision: string | null = value?.decision ?? null
  const consequences: string | null = value?.consequences ?? null

  return (
    <div
      style={{
        margin: '1.5rem 0',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 16px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-text-muted)',
        }}
      >
        Decision Record
      </div>

      {/* Sections */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {[
          { label: 'Context', content: context },
          { label: 'Decision', content: decision },
          { label: 'Consequences', content: consequences },
        ].map(({ label, content: c }, i) =>
          c ? (
            <div
              key={label}
              style={{
                padding: '12px 16px',
                borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                background: label === 'Decision' ? 'var(--color-bg-subtle)' : undefined,
              }}
            >
              <RecordSection label={label} content={c} />
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}
