'use client'

import { useState } from 'react'

interface Props {
  /** The raw markdown string to copy */
  markdown: string
  /** Path used for the "View raw" link — e.g. "/engineering/my-article" */
  path: string
}

export function CopyMarkdownButtons({ markdown, path }: Props): React.JSX.Element {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select a temp textarea
      const ta = document.createElement('textarea')
      ta.value = markdown
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    lineHeight: 1,
    transition: 'all 0.1s',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Copy button */}
      <button
        onClick={handleCopy}
        style={{
          ...btnBase,
          border: '1px solid var(--color-border)',
          background: copied ? 'var(--color-surface)' : 'transparent',
          color: copied ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
        }}
        title="Kopier som Markdown"
      >
        {copied ? (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kopiert!
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 4V2.5A.5.5 0 007.5 2h-5A.5.5 0 002 2.5v5a.5.5 0 00.5.5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Copy
          </>
        )}
      </button>

      {/* View raw link */}
      <a
        href={`${path}/raw`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...btnBase,
          border: '1px solid transparent',
          background: 'transparent',
          color: 'var(--color-text-muted)',
        }}
        title="Åpne som rå Markdown"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M5 2H2.5A.5.5 0 002 2.5v7a.5.5 0 00.5.5h7a.5.5 0 00.5-.5V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M7 2h3v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 2L6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Raw ↗
      </a>
    </div>
  )
}
