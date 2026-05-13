import React from 'react'
import { set, unset } from 'sanity'
import type { StringInputProps } from 'sanity'

// ── SVG thumbnails ────────────────────────────────────────────────────────────

function DoubleDiamondSvg(): React.JSX.Element {
  return (
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <polygon points="20,4 36,20 20,36 4,20" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
      <polygon points="60,4 76,20 60,36 44,20" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.5" />
      <line x1="36" y1="20" x2="44" y2="20" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="2,2" />
    </svg>
  )
}

function TwoByTwoSvg(): React.JSX.Element {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <rect x="4" y="4" width="33" height="33" rx="3" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
      <rect x="43" y="4" width="33" height="33" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="4" y="43" width="33" height="33" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="43" y="43" width="33" height="33" rx="3" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
    </svg>
  )
}

function PhasesSvg(): React.JSX.Element {
  return (
    <svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {[
        { x: 2, color: '#dbeafe', stroke: '#3b82f6' },
        { x: 22, color: '#ede9fe', stroke: '#8b5cf6' },
        { x: 42, color: '#dcfce7', stroke: '#22c55e' },
        { x: 62, color: '#fef3c7', stroke: '#f59e0b' },
      ].map(({ x, color, stroke }, i) => (
        <g key={i}>
          <rect x={x} y="8" width="16" height="24" rx="2" fill={color} stroke={stroke} strokeWidth="1.5" />
          {i < 3 && (
            <polyline
              points={`${x + 16},20 ${x + 22},20`}
              stroke="#9ca3af"
              strokeWidth="1.5"
              markerEnd="url(#arr)"
            />
          )}
        </g>
      ))}
      <defs>
        <marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L4,2 L0,4 Z" fill="#9ca3af" />
        </marker>
      </defs>
    </svg>
  )
}

function ComparisonSvg(): React.JSX.Element {
  return (
    <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* header row */}
      <rect x="22" y="4" width="25" height="10" rx="2" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2" />
      <rect x="51" y="4" width="25" height="10" rx="2" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="1.2" />
      {/* row labels */}
      {[18, 32, 46].map((y) => (
        <rect key={y} x="2" y={y} width="16" height="9" rx="2" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
      ))}
      {/* cells */}
      {[18, 32, 46].map((y) =>
        [22, 51].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="25" height="9" rx="2" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
        )),
      )}
    </svg>
  )
}

// ── Options ───────────────────────────────────────────────────────────────────

const OPTIONS: {
  value: string
  label: string
  description: string
  Thumbnail: () => React.JSX.Element
}[] = [
  {
    value: 'double-diamond',
    label: 'Double diamond',
    description: 'Explore → Define → Develop → Deliver',
    Thumbnail: DoubleDiamondSvg,
  },
  {
    value: 'two-by-two',
    label: 'Two-by-two',
    description: '2×2 priority / comparison matrix',
    Thumbnail: TwoByTwoSvg,
  },
  {
    value: 'phases',
    label: 'Phases',
    description: 'Sequential steps with arrows',
    Thumbnail: PhasesSvg,
  },
  {
    value: 'comparison',
    label: 'Comparison',
    description: 'Row/column comparison table',
    Thumbnail: ComparisonSvg,
  },
]

// ── Input component ───────────────────────────────────────────────────────────

export function ConceptModelVariantInput(props: StringInputProps): React.JSX.Element {
  const { value, onChange, readOnly } = props

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
      }}
    >
      {OPTIONS.map(({ value: opt, label, description, Thumbnail }) => {
        const selected = value === opt
        return (
          <button
            key={opt}
            type="button"
            disabled={readOnly ?? false}
            onClick={() => onChange(selected ? unset() : set(opt))}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 0,
              padding: 0,
              border: `2px solid ${selected ? '#1d4ed8' : '#e5e7eb'}`,
              borderRadius: 8,
              background: selected ? '#eff6ff' : '#fff',
              cursor: readOnly ? 'default' : 'pointer',
              overflow: 'hidden',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            {/* thumbnail */}
            <div
              style={{
                padding: 12,
                background: selected ? '#dbeafe' : '#f9fafb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 72,
              }}
            >
              <div style={{ width: 64, height: 48 }}>
                <Thumbnail />
              </div>
            </div>

            {/* label + description */}
            <div
              style={{
                padding: '8px 10px',
                borderTop: `1px solid ${selected ? '#bfdbfe' : '#f3f4f6'}`,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected ? '#1d4ed8' : '#111827',
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{description}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
