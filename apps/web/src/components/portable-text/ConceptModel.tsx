'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import { baseBodyComponents } from './bodyComponents'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Item {
  _key?: string
  label: string
  sublabel?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any[]
  color?: string
}

// ── Shared constants ──────────────────────────────────────────────────────────

const ACCENT = '#6366f1'

function ContentBlocks({ blocks }: { blocks: Item['content'] }) {
  if (!blocks?.length) return null
  return (
    <div className="prose">
      <PortableText value={blocks} components={baseBodyComponents} />
    </div>
  )
}

function ModelHeader({ title, description }: { title?: string; description?: string }) {
  if (!title && !description) return null
  return (
    <div style={{ marginBottom: 16 }}>
      {title && (
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', marginBottom: 3 }}>
          {title}
        </div>
      )}
      {description && (
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {description}
        </div>
      )}
    </div>
  )
}

// Wrapper shared by all variants
function ModelFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--color-surface)',
    }}>
      {children}
    </div>
  )
}

// ── Double Diamond ────────────────────────────────────────────────────────────

// Decorative SVG header showing the two-diamond shape
function DiamondTrack({ count }: { count: number }) {
  // Build a polyline that approximates double-diamond shape across `count` phases
  const W = 400
  const H = 48
  const mid = H / 2
  const step = W / count
  const pts = [0, mid]
  for (let i = 0; i < count; i++) {
    const isDiverge = i % 2 === 0
    const peakY = isDiverge ? 4 : H - 4
    pts.push((i + 0.5) * step, peakY)
    pts.push((i + 1) * step, mid)
  }
  const pointsStr = pts.reduce<string[]>((acc, v, i) => {
    if (i % 2 === 0) acc.push(`${v},`)
    else if (acc.length > 0) acc[acc.length - 1]! += v
    return acc
  }, []).join(' ')

  return (
    <div style={{ background: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)', padding: '0 20px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} height={H} width="100%" aria-hidden preserveAspectRatio="none">
        <polyline
          points={pointsStr}
          fill="none"
          stroke={ACCENT}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.5"
        />
        {Array.from({ length: count }, (_, i) => (
          <circle
            key={i}
            cx={(i + 0.5) * step}
            cy={i % 2 === 0 ? 4 : H - 4}
            r="3"
            fill={ACCENT}
            opacity="0.6"
          />
        ))}
      </svg>
    </div>
  )
}

function DoubleDiamondVariant({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number>(0)

  return (
    <ModelFrame>
      {/* Phase selector row */}
      <div style={{ display: 'flex', overflowX: 'auto' }}>
        {items.map((item, i) => {
          const isActive = active === i
          return (
            <button
              key={item._key ?? i}
              type="button"
              aria-expanded={isActive}
              onClick={() => setActive(i)}
              style={{
                flex: '1 0 120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '24px 16px 18px',
                background: isActive
                  ? `color-mix(in srgb, ${ACCENT} 6%, var(--color-surface))`
                  : 'var(--color-surface)',
                borderRight: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
                borderBottom: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background 0.15s',
              }}
            >
              {/* Large diamond shape */}
              <span style={{
                display: 'inline-block',
                width: 60,
                height: 60,
                background: isActive
                  ? ACCENT
                  : `color-mix(in srgb, ${ACCENT} 10%, var(--color-surface))`,
                transform: 'rotate(45deg)',
                borderRadius: 6,
                flexShrink: 0,
                border: `2px solid ${isActive ? ACCENT : `color-mix(in srgb, ${ACCENT} 30%, var(--color-border))`}`,
                transition: 'background 0.15s, border-color 0.15s',
              }} />

              <span style={{
                fontWeight: 700,
                fontSize: 13,
                color: isActive ? ACCENT : 'var(--color-text)',
                lineHeight: 1.3,
                transition: 'color 0.15s',
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      {items[active] && (
        <div style={{
          padding: '16px 20px',
          borderTop: `2px solid ${ACCENT}`,
          background: `color-mix(in srgb, ${ACCENT} 4%, var(--color-surface))`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: ACCENT }}>
            {items[active].label}
          </div>
          <ContentBlocks blocks={items[active].content} />
          {!items[active].content?.length && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Ingen innhold lagt til ennå.
            </p>
          )}
        </div>
      )}
    </ModelFrame>
  )
}

// ── Two-by-two ────────────────────────────────────────────────────────────────

function TwoByTwoVariant({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null)
  const visible = items.slice(0, 4)

  const BG: Record<number, string> = {
    0: '#7c3aed',
    1: '#0369a1',
    2: '#0369a1',
    3: '#7c3aed',
  }

  return (
    <ModelFrame>
      {/* 2×2 grid */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
        }}>
          {[0, 1, 2, 3].map((i) => {
            const item = visible[i]
            const isActive = active === i
            const accent = item?.color ?? BG[i] ?? ACCENT
            return (
              <button
                key={item?._key ?? i}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive((p) => (p === i ? null : i))}
                disabled={!item}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '20px 18px',
                  borderRight: i % 2 === 0 ? '1px solid var(--color-border)' : 'none',
                  borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none',
                  background: isActive
                    ? `color-mix(in srgb, ${accent} 12%, var(--color-surface))`
                    : 'var(--color-surface)',
                  cursor: item ? 'pointer' : 'default',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  outline: isActive ? `2px solid ${accent}` : 'none',
                  outlineOffset: -2,
                  minHeight: 100,
                  gap: 6,
                }}
              >
                {/* Corner indicator */}
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: isActive ? accent : 'var(--color-border)',
                  alignSelf: 'flex-end',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }} />
                {item ? (
                  <>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)', lineHeight: 1.3 }}>
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.sublabel}</span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>—</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Center axis lines */}
        <div aria-hidden style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--color-border)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--color-border)', pointerEvents: 'none' }} />

        {/* Axis arrows */}
        <div aria-hidden style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1 }}>▶</div>
        <div aria-hidden style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--color-text-muted)', lineHeight: 1 }}>▲</div>
      </div>

      {/* Expanded content */}
      {active !== null && visible[active] && (
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-subtle)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--color-text)' }}>
            {visible[active]!.label}
          </div>
          <ContentBlocks blocks={visible[active]!.content} />
          {!visible[active]!.content?.length && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Ingen innhold lagt til ennå.
            </p>
          )}
        </div>
      )}
    </ModelFrame>
  )
}

// ── Phases (timeline) ─────────────────────────────────────────────────────────

function PhasesVariant({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null)
  const toggle = (i: number) => setActive((p) => (p === i ? null : i))

  return (
    <ModelFrame>
      <div style={{ padding: '20px 20px 16px', overflowX: 'auto' }}>
        {/* Track row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: `${items.length * 100}px` }}>
          {items.map((item, i) => {
            const isActive = active === i
            const itemColor = item.color ?? ACCENT
            return (
              <div key={item._key ?? i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <button
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => toggle(i)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    flex: '0 0 80px',
                    width: 80,
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isActive ? itemColor : 'var(--color-surface)',
                    border: `2px solid ${isActive ? itemColor : 'var(--color-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                    flexShrink: 0,
                    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isActive ? itemColor : 'var(--color-text)',
                      lineHeight: 1.3,
                      transition: 'color 0.15s',
                    }}>
                      {item.label}
                    </div>
                    {item.sublabel && (
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                </button>

                {/* Connector line to next phase */}
                {i < items.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: `linear-gradient(to right, ${active === i ? itemColor : 'var(--color-border)'}, ${active === i + 1 ? (items[i + 1]?.color ?? ACCENT) : 'var(--color-border)'})`,
                    margin: '0 4px',
                    marginBottom: 44, // align with circle centre
                    transition: 'background 0.15s',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Expanded content */}
      {active !== null && items[active] && (
        <div style={{
          padding: '14px 20px 16px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text)' }}>
              {active + 1}. {items[active].label}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                disabled={active === 0}
                onClick={() => setActive((p) => (p !== null && p > 0 ? p - 1 : p))}
                style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-border)', background: 'transparent', cursor: active === 0 ? 'not-allowed' : 'pointer', opacity: active === 0 ? 0.35 : 1 }}
              >
                ← Forrige
              </button>
              <button
                type="button"
                disabled={active === items.length - 1}
                onClick={() => setActive((p) => (p !== null && p < items.length - 1 ? p + 1 : p))}
                style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--color-border)', background: 'transparent', cursor: active === items.length - 1 ? 'not-allowed' : 'pointer', opacity: active === items.length - 1 ? 0.35 : 1 }}
              >
                Neste →
              </button>
            </div>
          </div>
          <ContentBlocks blocks={items[active].content} />
          {!items[active].content?.length && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
              Ingen innhold lagt til ennå.
            </p>
          )}
        </div>
      )}
    </ModelFrame>
  )
}

// ── Comparison ────────────────────────────────────────────────────────────────

function ComparisonVariant({ items }: { items: Item[] }) {
  if (!items.length) return null
  const cols = items.length

  return (
    <ModelFrame>
      <div style={{ overflowX: 'auto' }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(140px, 1fr))`,
          background: 'var(--color-bg-subtle)',
          borderBottom: '2px solid var(--color-border)',
        }}>
          {items.map((item, i) => (
            <div
              key={item._key ?? i}
              style={{
                padding: '12px 16px',
                borderRight: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>{item.label}</div>
              {item.sublabel && (
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{item.sublabel}</div>
              )}
            </div>
          ))}
        </div>

        {/* Content row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(140px, 1fr))`,
        }}>
          {items.map((item, i) => (
            <div
              key={item._key ?? i}
              style={{
                padding: '14px 16px',
                borderRight: i < items.length - 1 ? '1px solid var(--color-border)' : 'none',
                verticalAlign: 'top',
              }}
            >
              {item.content?.length ? (
                <ContentBlocks blocks={item.content} />
              ) : (
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>—</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </ModelFrame>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ConceptModel({ value }: { value: any }): React.JSX.Element | null {
  const variant: string = value?.variant
  const items: Item[] = value?.items ?? []
  const title: string | undefined = value?.title
  const description: string | undefined = value?.description

  if (!variant || !items.length) return null

  return (
    <div style={{ margin: '1.5rem 0' }}>
      <ModelHeader title={title} description={description} />

      {variant === 'double-diamond' && <DoubleDiamondVariant items={items} />}
      {variant === 'two-by-two' && <TwoByTwoVariant items={items} />}
      {variant === 'phases' && <PhasesVariant items={items} />}
      {variant === 'comparison' && <ComparisonVariant items={items} />}
    </div>
  )
}
