'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Hotspot {
  _key?: string
  x: number
  y: number
  label?: string
  content?: string
}

// ── Close button ──────────────────────────────────────────────────────────────

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Lukk"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-subtle, #f6f8fa)',
        cursor: 'pointer',
        fontSize: 14,
        lineHeight: 1,
        color: 'var(--color-text-muted)',
        padding: 0,
      }}
    >
      ×
    </button>
  )
}

// ── Hotspot dot button ────────────────────────────────────────────────────────

function HotspotDot({
  hotspot,
  index,
  isActive,
  onToggle,
}: {
  hotspot: Hotspot
  index: number
  isActive: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={hotspot.label ?? `Hotspot ${index + 1}`}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      onClick={onToggle}
      style={{
        position: 'absolute',
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        transform: 'translate(-50%, -50%)',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: isActive ? '#4f46e5' : '#6366f1',
        border: '2.5px solid #fff',
        cursor: 'pointer',
        boxShadow: isActive
          ? '0 0 0 3px rgba(99,102,241,0.35)'
          : '0 1px 4px rgba(0,0,0,0.25)',
        animation: isActive ? 'none' : 'hf-pulse 2.4s ease-in-out infinite',
        zIndex: 2,
        padding: 0,
        outline: 'none',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'block',
          textAlign: 'center',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: '24px',
        }}
      >
        {index + 1}
      </span>
    </button>
  )
}

// ── Desktop floating popover ──────────────────────────────────────────────────

function Popover({
  hotspot,
  onClose,
  firstFocusRef,
}: {
  hotspot: Hotspot
  onClose: () => void
  firstFocusRef: React.RefObject<HTMLButtonElement | null>
}) {
  // Flip vertically: open above if hotspot is in lower 55% of image
  const openAbove = hotspot.y > 55
  // Clamp X so card doesn't go off-screen edges (assume 240px card)
  const clampedX = Math.min(Math.max(hotspot.x, 18), 82)

  return (
    <div
      role="dialog"
      aria-modal={false}
      aria-label={hotspot.label ?? 'Hotspot'}
      style={{
        position: 'absolute',
        left: `${clampedX}%`,
        top: openAbove
          ? `calc(${hotspot.y}% - 18px)`
          : `calc(${hotspot.y}% + 18px)`,
        transform: openAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        zIndex: 10,
        width: 240,
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        boxShadow: '0 6px 20px rgba(0,0,0,0.14)',
        padding: '12px 14px',
        fontSize: 13,
        lineHeight: 1.55,
        color: 'var(--color-text)',
      }}
    >
      <CloseButton onClose={onClose} />
      {hotspot.label && (
        <div style={{ fontWeight: 700, marginBottom: hotspot.content ? 5 : 0, paddingRight: 24, fontSize: 13 }}>
          {hotspot.label}
        </div>
      )}
      {hotspot.content && (
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{hotspot.content}</p>
      )}
      {/* Small caret */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          [openAbove ? 'bottom' : 'top']: -7,
          transform: 'translateX(-50%)',
          width: 12,
          height: 7,
          overflow: 'hidden',
          display: 'block',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 10,
            height: 10,
            background: 'var(--color-surface, #fff)',
            border: '1px solid var(--color-border)',
            transform: openAbove ? 'rotate(45deg) translate(-1px, -5px)' : 'rotate(45deg) translate(-1px, 3px)',
            marginLeft: 1,
          }}
        />
      </span>
    </div>
  )
}

// ── Mobile bottom sheet ───────────────────────────────────────────────────────

function BottomSheet({
  hotspot,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  hotspot: Hotspot
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal
        aria-label={hotspot.label ?? 'Hotspot'}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'var(--color-surface, #fff)',
          borderRadius: '16px 16px 0 0',
          padding: '20px 20px 32px',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          animation: 'hf-sheet-in 0.22s ease-out',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--color-border)', margin: '0 auto 16px' }} aria-hidden />

        <CloseButton onClose={onClose} />

        {/* Counter */}
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>
          {index + 1} / {total}
        </div>

        {hotspot.label && (
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: hotspot.content ? 8 : 0 }}>
            {hotspot.label}
          </div>
        )}
        {hotspot.content && (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
            {hotspot.content}
          </p>
        )}

        {/* Prev / Next nav */}
        {total > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              type="button"
              onClick={onPrev}
              disabled={index === 0}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.35 : 1, fontSize: 13 }}
            >
              ← Forrige
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={index === total - 1}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.35 : 1, fontSize: 13 }}
            >
              Neste →
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HotspotFigure({ value }: { value: any }): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const firstFocusRef = useRef<HTMLButtonElement | null>(null)

  const imageUrl: string = value?.imageUrl ?? ''
  const alt: string = value?.alt ?? ''
  const caption: string | undefined = value?.caption
  const hotspots: Hotspot[] = value?.hotspots ?? []

  // Track mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (activeIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIndex])

  const toggle = useCallback(
    (i: number) => setActiveIndex((prev) => (prev === i ? null : i)),
    [],
  )
  const close = useCallback(() => setActiveIndex(null), [])
  const prev = useCallback(() => setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i)), [])
  const next = useCallback(
    () => setActiveIndex((i) => (i !== null && i < hotspots.length - 1 ? i + 1 : i)),
    [hotspots.length],
  )

  if (!imageUrl) return null

  const activeHotspot = activeIndex !== null ? hotspots[activeIndex] : null

  return (
    <figure style={{ margin: '1.5rem 0' }}>
      {/* Image + hotspot dots */}
      <div style={{ position: 'relative', display: 'block', lineHeight: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, border: '1px solid var(--color-border)' }}
        />

        {hotspots.map((hs, i) => (
          <HotspotDot
            key={hs._key ?? i}
            hotspot={hs}
            index={i}
            isActive={activeIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}

        {/* Desktop popover — rendered inside the relative container */}
        {!isMobile && activeHotspot && activeIndex !== null && (
          <Popover
            hotspot={activeHotspot}
            onClose={close}
            firstFocusRef={firstFocusRef}
          />
        )}
      </div>

      {/* Mobile bottom sheet — rendered outside container so it can be fixed */}
      {isMobile && activeHotspot && activeIndex !== null && (
        <BottomSheet
          hotspot={activeHotspot}
          index={activeIndex}
          total={hotspots.length}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}

      {caption && (
        <figcaption
          style={{
            marginTop: 8,
            fontSize: 13,
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
