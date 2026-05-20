'use client'

import React, { useState } from 'react'

export function CopyButton({ code, className, style }: { code: string; className?: string; style?: React.CSSProperties }): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (className) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className={className}
        style={style}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : 'Copy code'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        border: '1px solid var(--color-border)',
        background: 'transparent',
        color: copied ? '#16a34a' : 'var(--color-text-muted)',
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'color 0.15s',
        flexShrink: 0,
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
