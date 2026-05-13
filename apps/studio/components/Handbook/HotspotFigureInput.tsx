import React, { useCallback, useRef, useState } from 'react'
import { set, useClient } from 'sanity'
import type { ObjectInputProps } from 'sanity'

interface Hotspot {
  _key: string
  x: number
  y: number
  label?: string
  content?: string
}

interface HotspotFigureValue {
  image?: { asset?: { _ref?: string } }
  hotspots?: Hotspot[]
}

function buildImageUrl(projectId: string, dataset: string, ref: string): string {
  // ref format: image-{id}-{width}x{height}-{format}
  const parts = ref.split('-')
  const format = parts[parts.length - 1]
  const dimensions = parts[parts.length - 2]
  const id = parts.slice(1, parts.length - 2).join('-')
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`
}

const DRAG_THRESHOLD_PX = 5

export function HotspotFigureInput(props: ObjectInputProps): React.JSX.Element {
  const { value, onChange, renderDefault } = props
  const fig = value as HotspotFigureValue | undefined
  const hotspots: Hotspot[] = fig?.hotspots ?? []

  const client = useClient({ apiVersion: '2024-01-01' })
  const config = client.config()
  const projectId = config.projectId ?? ''
  const dataset = config.dataset ?? ''

  const imageRef = fig?.image?.asset?._ref
  const imageUrl = imageRef ? buildImageUrl(projectId, dataset, imageRef) : null

  const containerRef = useRef<HTMLDivElement>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [livePositions, setLivePositions] = useState<Record<string, { x: number; y: number }>>({})
  const dragRef = useRef<{
    key: string
    startClientX: number
    startClientY: number
    origX: number
    origY: number
    moved: boolean
  } | null>(null)

  // ── helpers ──────────────────────────────────────────────────────────────

  const patchHotspots = useCallback(
    (next: Hotspot[]) => {
      onChange(set(next, ['hotspots']))
    },
    [onChange],
  )

  const getPercent = useCallback((e: React.MouseEvent | PointerEvent): { x: number; y: number } | null => {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100))
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
  }, [])

  // ── image click → add hotspot ─────────────────────────────────────────

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dragRef.current?.moved) return
      const pos = getPercent(e)
      if (!pos) return
      const newHotspot: Hotspot = {
        _key: crypto.randomUUID(),
        x: pos.x,
        y: pos.y,
        label: '',
        content: '',
      }
      const next = [...hotspots, newHotspot]
      patchHotspots(next)
      setActiveKey(newHotspot._key)
    },
    [hotspots, patchHotspots, getPercent],
  )

  // ── drag hotspot ──────────────────────────────────────────────────────

  const handleCirclePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, hotspot: Hotspot) => {
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      dragRef.current = {
        key: hotspot._key,
        startClientX: e.clientX,
        startClientY: e.clientY,
        origX: hotspot.x,
        origY: hotspot.y,
        moved: false,
      }
    },
    [],
  )

  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag) return
      const dx = e.clientX - drag.startClientX
      const dy = e.clientY - drag.startClientY
      if (!drag.moved && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD_PX) return
      drag.moved = true
      const pos = getPercent(e)
      if (!pos) return
      setLivePositions((prev) => ({ ...prev, [drag.key]: pos }))
    },
    [getPercent],
  )

  const handleContainerPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null

      if (drag.moved) {
        const live = livePositions[drag.key]
        if (live) {
          const next = hotspots.map((h) => (h._key === drag.key ? { ...h, ...live } : h))
          patchHotspots(next)
          setLivePositions((prev) => {
            const copy = { ...prev }
            delete copy[drag.key]
            return copy
          })
        }
      } else {
        setActiveKey((prev) => (prev === drag.key ? null : drag.key))
      }
    },
    [hotspots, livePositions, patchHotspots],
  )

  // ── inline form helpers ───────────────────────────────────────────────

  const updateActiveField = useCallback(
    (field: 'label' | 'content', val: string) => {
      if (!activeKey) return
      const next = hotspots.map((h) => (h._key === activeKey ? { ...h, [field]: val } : h))
      patchHotspots(next)
    },
    [activeKey, hotspots, patchHotspots],
  )

  const removeHotspot = useCallback(
    (key: string) => {
      patchHotspots(hotspots.filter((h) => h._key !== key))
      setActiveKey((prev) => (prev === key ? null : prev))
    },
    [hotspots, patchHotspots],
  )

  const activeHotspot = hotspots.find((h) => h._key === activeKey)

  // ── render ────────────────────────────────────────────────────────────

  // Render default form but hide the hotspots array field since we manage it visually
  const membersWithoutHotspots = props.members.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.name !== 'hotspots',
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Standard fields: image, alt, caption */}
      {renderDefault({ ...props, members: membersWithoutHotspots } as typeof props)}

      {/* Visual hotspot editor */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            background: '#f3f4f6',
            borderBottom: '1px solid #e5e7eb',
            fontSize: 11,
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Hotspot editor — {hotspots.length} hotspot{hotspots.length !== 1 ? 's' : ''}</span>
          <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#9ca3af' }}>
            Click image to add · drag to move · click circle to edit
          </span>
        </div>

        {imageUrl ? (
          <div style={{ position: 'relative' }}>
            {/* Image + clickable overlay */}
            <div
              ref={containerRef}
              style={{ position: 'relative', cursor: 'crosshair', userSelect: 'none' }}
              onClick={handleImageClick}
              onPointerMove={handleContainerPointerMove}
              onPointerUp={handleContainerPointerUp}
            >
              <img
                src={imageUrl}
                alt=""
                draggable={false}
                style={{ width: '100%', display: 'block' }}
              />

              {/* Hotspot circles */}
              {hotspots.map((h) => {
                const live = livePositions[h._key]
                const x = live?.x ?? h.x
                const y = live?.y ?? h.y
                const isActive = activeKey === h._key
                return (
                  <div
                    key={h._key}
                    onPointerDown={(e) => handleCirclePointerDown(e, h)}
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isActive ? '#1d4ed8' : '#fff',
                      border: `3px solid ${isActive ? '#1d4ed8' : '#1d4ed8'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive ? '#fff' : '#1d4ed8',
                      transition: 'background 0.1s, color 0.1s',
                      zIndex: 10,
                    }}
                  >
                    {hotspots.indexOf(h) + 1}
                  </div>
                )
              })}
            </div>

            {/* Inline form for active hotspot */}
            {activeHotspot && (
              <div
                style={{
                  padding: 16,
                  borderTop: '1px solid #e5e7eb',
                  background: '#eff6ff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
                    Hotspot {hotspots.indexOf(activeHotspot) + 1}
                    <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
                      ({Math.round(activeHotspot.x)}%, {Math.round(activeHotspot.y)}%)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeHotspot(activeHotspot._key) }}
                    style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                  >
                    Remove
                  </button>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Label</span>
                  <input
                    type="text"
                    value={activeHotspot.label ?? ''}
                    onChange={(e) => { e.stopPropagation(); updateActiveField('label', e.target.value) }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Short label…"
                    style={{ padding: '6px 8px', border: '1px solid #bfdbfe', borderRadius: 4, fontSize: 13, background: '#fff' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Content</span>
                  <textarea
                    value={activeHotspot.content ?? ''}
                    onChange={(e) => { e.stopPropagation(); updateActiveField('content', e.target.value) }}
                    onClick={(e) => e.stopPropagation()}
                    rows={3}
                    placeholder="Description shown in the tooltip…"
                    style={{ padding: '6px 8px', border: '1px solid #bfdbfe', borderRadius: 4, fontSize: 13, resize: 'vertical', fontFamily: 'inherit', background: '#fff' }}
                  />
                </label>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveKey(null) }}
                  style={{ alignSelf: 'flex-end', fontSize: 12, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: 24, color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>
            Upload an image above to start placing hotspots
          </div>
        )}
      </div>
    </div>
  )
}
