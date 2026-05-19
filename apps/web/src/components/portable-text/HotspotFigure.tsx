'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon } from '../ui/Icon'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Hotspot {
  _key?: string
  x: number
  y: number
  label?: string
  content?: string
}

// ── Hotspot dot + (desktop) inline popover ────────────────────────────────────

function HotspotDot({
  hotspot,
  index,
  isActive,
  showPopover,
  onToggle,
  buttonRef,
}: {
  hotspot: Hotspot
  index: number
  isActive: boolean
  showPopover: boolean
  onToggle: () => void
  buttonRef?: React.Ref<HTMLButtonElement>
}) {
  // State suffix maps onto `.hb-hot--{state}` from the design system.
  // - default: inactive dot with the pulsing accent ring
  // - active:  the currently selected dot
  const stateClass = isActive ? 'hb-hot--active' : 'hb-hot--default'
  // Flip the popover above the dot when the hotspot sits in the lower half of
  // the image, so it stays inside the figure bounds.
  const flipClass = hotspot.y > 60 ? ' hb-hot--flip' : ''

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={hotspot.label ?? `Hotspot ${index + 1}`}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      onClick={onToggle}
      className={`hb-hot ${stateClass}${flipClass}`}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      <span className="hb-hot__pulse" aria-hidden="true" />
      <span className="hb-hot__dot">{index + 1}</span>

      {/* Desktop popover — only rendered when this dot is the active one and
          we're on desktop. The design CSS positions this below the dot. */}
      {showPopover && isActive && (
        <span
          className="hb-hot__pop"
          role="dialog"
          aria-label={hotspot.label ?? `Hotspot ${index + 1}`}
        >
          {hotspot.label && (
            <span className="hb-hot__poptitle">{hotspot.label}</span>
          )}
          {hotspot.content && (
            <span className="hb-hot__popbody">{hotspot.content}</span>
          )}
        </span>
      )}
    </button>
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
  // Backdrop + sheet. The `.hb-bsheet` design class is position:absolute, so
  // we promote it to a fixed-position overlay here.
  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={hotspot.label ?? `Hotspot ${index + 1}`}
        className="hb-bsheet"
        style={{ position: 'fixed', zIndex: 50 }}
      >
        <div className="hb-bsheet__handle" aria-hidden="true" />

        <div className="hb-bsheet__title">
          {index + 1} · {hotspot.label ?? `Hotspot ${index + 1}`}
        </div>
        {hotspot.content && (
          <div className="hb-bsheet__body">{hotspot.content}</div>
        )}

        <div className="hb-bsheet__nav">
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            className="hb-icon-btn"
            style={{
              width: 'auto',
              padding: '6px 10px',
              fontSize: 12,
              opacity: index === 0 ? 0.35 : 1,
              cursor: index === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Forrige
          </button>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'var(--hb-fg-3)' }}>
            {index + 1} / {total}
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onNext}
            disabled={index === total - 1}
            className="hb-icon-btn"
            style={{
              width: 'auto',
              padding: '6px 10px',
              fontSize: 12,
              opacity: index === total - 1 ? 0.35 : 1,
              cursor: index === total - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Neste →
          </button>
        </div>
      </div>
    </>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HotspotFigure({ value }: { value: any }): React.JSX.Element | null {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const activeButtonRef = useRef<HTMLButtonElement | null>(null)

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

  // Close on Escape and return focus to the dot
  useEffect(() => {
    if (activeIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null)
        activeButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIndex])

  const toggle = useCallback(
    (i: number) => setActiveIndex((prev) => (prev === i ? null : i)),
    [],
  )
  const close = useCallback(() => setActiveIndex(null), [])
  const prev = useCallback(
    () => setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i)),
    [],
  )
  const next = useCallback(
    () => setActiveIndex((i) => (i !== null && i < hotspots.length - 1 ? i + 1 : i)),
    [hotspots.length],
  )

  if (!imageUrl) return null

  // Image failed to load → render design-system error fallback.
  if (imageFailed) {
    return (
      <figure className="hb-hotspots">
        <div className="hb-hotspots__canvas">
          <div
            className="hb-hotspots__imgerr"
            role="img"
            aria-label={alt || caption || 'Bildet kunne ikke lastes'}
          >
            <Icon name="imageOff" size={28} />
            <span>{alt || caption || 'Bildet kunne ikke lastes'}</span>
          </div>
        </div>
      </figure>
    )
  }

  const activeHotspot =
    activeIndex !== null ? hotspots[activeIndex] ?? null : null

  return (
    <figure className="hb-hotspots">
      <div className="hb-hotspots__canvas">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          onError={() => setImageFailed(true)}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 4,
          }}
        />

        {hotspots.map((hs, i) => (
          <HotspotDot
            key={hs._key ?? i}
            hotspot={hs}
            index={i}
            isActive={activeIndex === i}
            showPopover={!isMobile}
            onToggle={() => toggle(i)}
            buttonRef={activeIndex === i ? activeButtonRef : undefined}
          />
        ))}

        {/* Mobile bottom sheet — rendered outside the dot button so it can be
            a fullscreen overlay. */}
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
      </div>

      {caption && <figcaption className="hb-hotspots__cap">{caption}</figcaption>}
    </figure>
  )
}
