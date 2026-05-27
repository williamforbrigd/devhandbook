'use client'

import { useState } from 'react'

// ── Checkbox icon ─────────────────────────────────────────────────────────────

function CheckboxIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
      <rect width="17" height="17" rx="3.5" fill="#6366f1" />
      <path d="M4.5 8.5l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="16" height="16" rx="3" stroke="var(--color-border)" />
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CheckItem {
  _key?: string
  text: string
  optional?: boolean
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Checklist({ value }: { value: any }): React.JSX.Element | null {
  const title: string | undefined = value?.title
  const items: CheckItem[] = value?.items ?? []

  const [checked, setChecked] = useState<Set<number>>(() => new Set())

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  if (!items.length) return null

  const doneCount = checked.size
  const requiredCount = items.filter((it) => !it.optional).length

  return (
    <div style={{ margin: '1.25rem 0' }}>
      {/* Header */}
      {(title || requiredCount > 0) && (
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          {title && (
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{title}</div>
          )}
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
            {doneCount} / {items.length}
          </span>
        </div>
      )}

      {/* Progress bar */}
      {items.length > 0 && (
        <div style={{
          height: 3,
          borderRadius: 999,
          background: 'var(--color-border)',
          marginBottom: 10,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            borderRadius: 999,
            background: doneCount === items.length ? '#16a34a' : '#6366f1',
            width: `${(doneCount / items.length) * 100}%`,
            transition: 'width 0.2s ease, background 0.2s',
          }} />
        </div>
      )}

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, i) => {
          const isChecked = checked.has(i)
          return (
            <label
              key={item._key ?? i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '7px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                background: isChecked
                  ? 'color-mix(in srgb, #6366f1 6%, var(--color-surface))'
                  : 'transparent',
                border: `1px solid ${isChecked ? 'color-mix(in srgb, #6366f1 18%, transparent)' : 'transparent'}`,
                transition: 'background 0.12s',
                userSelect: 'none',
              }}
            >
              {/* Hidden native input for a11y */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(i)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                aria-label={item.text}
              />

              <span style={{ flexShrink: 0, marginTop: 1 }}>
                <CheckboxIcon checked={isChecked} />
              </span>

              <span style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: isChecked ? 'var(--color-text-muted)' : item.optional ? 'var(--color-text-muted)' : 'var(--color-text)',
                fontStyle: item.optional && !isChecked ? 'italic' : 'normal',
                transition: 'color 0.12s',
              }}>
                {item.text}
                {item.optional && !isChecked && (
                  <span style={{
                    marginLeft: 7,
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 3,
                    padding: '1px 5px',
                    verticalAlign: 'middle',
                  }}>
                    VALGFRITT
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
