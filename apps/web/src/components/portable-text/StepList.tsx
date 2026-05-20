import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'

// ── Minimal content renderer ──────────────────────────────────────────────────

const contentPt: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p style={{ margin: '0 0 0.5em', fontSize: 13, lineHeight: 1.65, color: 'var(--color-text)' }}>
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code style={{ fontSize: '0.875em', padding: '1px 4px', borderRadius: 3, background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)', fontFamily: 'ui-monospace, monospace' }}>
        {children}
      </code>
    ),
  },
}

// ── Role chip colours ─────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  developer:  { bg: '#dbeafe', color: '#1d4ed8' },
  designer:   { bg: '#fce7f3', color: '#9d174d' },
  lead:       { bg: '#fef9c3', color: '#854d0e' },
  product:    { bg: '#dcfce7', color: '#15803d' },
  qa:         { bg: '#fee2e2', color: '#b91c1c' },
  devops:     { bg: '#e0e7ff', color: '#4338ca' },
}

function roleStyle(role: string) {
  const key = role.toLowerCase()
  return ROLE_COLORS[key] ?? { bg: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Step {
  _key?: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any[]
  role?: string
  duration?: string
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StepList({ value }: { value: any }): React.JSX.Element | null {
  const steps: Step[] = value?.steps ?? []
  if (!steps.length) return null

  return (
    <ol className="hb-steps">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const rs = step.role ? roleStyle(step.role) : null

        return (
          <li key={step._key ?? i} className="hb-step">
            {/* Circle + connector */}
            <div className="hb-step__top">
              <span className="hb-step__num">{i + 1}</span>
              {!isLast && <span className="hb-step__connector" aria-hidden />}
            </div>

            {/* Content */}
            <div className="hb-step__body">
              <div className="hb-step__head">
                <span className="hb-step__title">{step.title}</span>
              </div>
              {(step.role || step.duration) && (
                <div className="hb-step__metas">
                  {step.role && rs && (
                    <span
                      className="hb-step__role"
                      style={{ background: rs.bg, color: rs.color }}
                    >
                      {step.role}
                    </span>
                  )}
                  {step.duration && (
                    <span className="hb-step__dur">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {step.duration}
                    </span>
                  )}
                </div>
              )}
              {step.description && step.description.length > 0 && (
                <div className="hb-step__txt">
                  <PortableText value={step.description} components={contentPt} />
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
