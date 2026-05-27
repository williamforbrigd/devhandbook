import React from 'react'
import { PortableText } from '@portabletext/react'
import type { PortableTextComponents } from '@portabletext/react'
import { Icon } from '../ui/Icon'

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
    <ol className="hb-steps">
      {steps.map((step, i) => {
        const stepRoles = (step.roles ?? []).filter((r): r is Role => r != null)

        return (
          <li key={step._key ?? i} className="hb-step">
            {/* Step number */}
            <span className="hb-step__num">{i + 1}</span>

            {/* Content */}
            <div>
              <div className="hb-step__head">
                <span className="hb-step__title">{step.title}</span>

                <span className="hb-step__metas">
                  {/* Role chips */}
                  {stepRoles.map((r, ri) => (
                    <span key={r._id ?? ri} className="hb-step__role">
                      <Icon name="user" size={11} />
                      {r.title}
                    </span>
                  ))}

                  {/* Duration chip */}
                  {step.duration && (
                    <span className="hb-step__dur">
                      <Icon name="clock" size={11} />
                      {step.duration}
                    </span>
                  )}
                </span>
              </div>

              {/* Description */}
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
