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
  const key = role?.toLowerCase() ?? ''
  return ROLE_COLORS[key] ?? { bg: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Role {
  _id: string
  title: string
}

interface Step {
  _key?: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any[]
  roles?: Role[]
  duration?: string
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StepList({ value }: { value: any }): React.JSX.Element | null {
  const steps: Step[] = value?.steps ?? []
  if (!steps.length) return null

  return (
    <div style={{ margin: '1.25rem 0' }}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const stepRoles = (step.roles ?? []).filter((r): r is Role => r != null)

        return (
          <div
            key={step._key ?? i}
            style={{ display: 'flex', gap: 16, paddingBottom: isLast ? 0 : 20 }}
          >
            {/* Left column: number + connector line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--color-bg-subtle)',
                border: '2px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--color-text-muted)',
                flexShrink: 0,
                zIndex: 1,
              }}>
                {i + 1}
              </div>
              {!isLast && (
                <div style={{
                  width: 2,
                  flex: 1,
                  background: 'var(--color-border)',
                  marginTop: 4,
                  minHeight: 20,
                }} />
              )}
            </div>

            {/* Right column: content */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', lineHeight: 1.3 }}>
                  {step.title}
                </span>

                {/* Role chips */}
                {stepRoles.map((r, ri) => {
                  const rs = roleStyle(r.title)
                  return (
                    <span key={r._id ?? ri} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '1px 8px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: rs.bg,
                      color: rs.color,
                      lineHeight: 1.8,
                      whiteSpace: 'nowrap',
                    }}>
                      {r.title}
                    </span>
                  )
                })}

                {/* Duration chip */}
                {step.duration && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '1px 8px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                    background: 'var(--color-bg-subtle)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                    lineHeight: 1.8,
                    whiteSpace: 'nowrap',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {step.duration}
                  </span>
                )}
              </div>

              {/* Description */}
              {step.description && step.description.length > 0 && (
                <div style={{ paddingBottom: isLast ? 0 : 4 }}>
                  <PortableText value={step.description} components={contentPt} />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
