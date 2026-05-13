'use client'

import React, { useEffect, useRef } from 'react'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) el.showModal()
    else el.close()
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => { if (e.target === dialogRef.current) onClose() }}
      style={{
        border: 'none',
        borderRadius: 12,
        padding: 0,
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        background: 'var(--color-bg, #fff)',
      }}
    >
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#9ca3af' }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text, #111827)' }}>Search</p>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Coming soon</p>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 8,
            padding: '6px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            fontSize: 13,
            background: 'transparent',
            cursor: 'pointer',
            color: 'inherit',
          }}
        >
          Close
        </button>
      </div>
    </dialog>
  )
}
