import React from 'react'
import { set, unset } from 'sanity'
import type { StringInputProps } from 'sanity'

const OPTIONS = [
  {
    value: 'established',
    label: 'Established',
    description: 'Velprøvd, bredt brukt i miljøet',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    value: 'recommended',
    label: 'Recommended',
    description: 'Anbefalt, noe mindre erfaring',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  {
    value: 'exploratory',
    label: 'Exploratory',
    description: 'Under utforskning — bruk med bevissthet',
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    value: 'deprecated',
    label: 'Deprecated',
    description: 'Frarådet — bevart for kontekst',
    color: '#dc2626',
    bg: '#fee2e2',
  },
]

export function MaturityInput(props: StringInputProps): React.JSX.Element {
  const { value, onChange } = props

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {OPTIONS.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(selected ? unset() : set(opt.value))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 6,
              border: `2px solid ${selected ? opt.color : '#e5e7eb'}`,
              background: selected ? opt.bg : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: opt.color,
                flexShrink: 0,
              }}
            />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: selected ? opt.color : '#111' }}>
                {opt.label}
              </span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{opt.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
