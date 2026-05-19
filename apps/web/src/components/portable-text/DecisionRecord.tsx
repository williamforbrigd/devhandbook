import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DecisionRecord({ value }: { value: any }): React.JSX.Element {
  const title: string | null       = value?.title       ?? null
  const context: string | null     = value?.context     ?? null
  const decision: string | null    = value?.decision    ?? null
  const consequences: string | null = value?.consequences ?? null

  const rows = [
    { label: 'Context',      content: context },
    { label: 'Decision',     content: decision },
    { label: 'Consequences', content: consequences },
  ].filter((r) => r.content)

  return (
    <div className="hb-dr">
      <div className="hb-dr__head">
        {title ?? 'Decision Record'}
      </div>
      {rows.map(({ label, content }) => (
        <div key={label} className="hb-dr__row">
          <span className="hb-dr__label">{label}</span>
          <span className="hb-dr__val" style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
        </div>
      ))}
    </div>
  )
}
