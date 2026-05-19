'use client'

import React, { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { Icon } from '../ui/Icon'
import type { MermaidStatus } from './MermaidDiagram'

const MermaidDiagram = dynamic(
  () => import('./MermaidDiagram').then((m) => m.MermaidDiagram),
  { ssr: false },
)

/**
 * Best-effort detection of the Mermaid diagram type from the source. Used as a
 * label in the diagram header (e.g. `Mermaid · sequenceDiagram`).
 */
function detectDiagramType(code: string): string {
  const first = code
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('%%'))
  if (!first) return 'diagram'
  const keyword = first.split(/\s+/)[0]
  return keyword || 'diagram'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DiagramBlock({ value }: { value: any }): React.JSX.Element | null {
  // `code` is a @sanity/code-input object: { _type: 'code', language, code }
  const raw = value?.code
  const code: string = (typeof raw === 'object' ? raw?.code : raw) ?? ''
  const caption: string | undefined = value?.caption

  const [status, setStatus] = useState<MermaidStatus>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleStatus = useCallback((next: MermaidStatus, err?: string) => {
    setStatus(next)
    setErrorMsg(next === 'error' ? err ?? 'Render failed' : null)
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Ignore — clipboard may be blocked
    }
  }, [code])

  if (!code.trim()) return null

  const diagramType = detectDiagramType(code)

  return (
    <figure className="hb-diagram">
      <div className="hb-diagram__head">
        <span>
          <Icon name="gitBranch" size={12} /> Mermaid · {diagramType}
        </span>
        <button
          type="button"
          className="hb-diagram__copy"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy Mermaid source'}
        >
          <Icon name={copied ? 'check' : 'copy'} size={12} />
          {copied ? 'Copied' : 'Copy Mermaid'}
        </button>
      </div>

      <div className={`hb-diagram__canvas hb-diagram__canvas--${status}`}>
        {status === 'loading' && (
          <div className="hb-diagram__loading">
            <div className="hb-spinner" aria-hidden="true">
              <Icon name="loader" size={20} />
            </div>
            <span>Renderer diagram…</span>
          </div>
        )}

        {status === 'error' && (
          <div className="hb-diagram__error">
            <div className="hb-diagram__errortitle">
              <Icon name="alertOctagon" size={14} />
              Klarte ikke rendre diagrammet.
              {errorMsg && (
                <span style={{ fontWeight: 400, opacity: 0.8 }}>
                  &nbsp;{errorMsg}
                </span>
              )}
            </div>
            <pre className="hb-diagram__errorpre">{code}</pre>
          </div>
        )}

        {/* MermaidDiagram is always mounted while we have code so it can
            (re)render; we just hide it when it isn't the rendered state. */}
        <div
          style={{
            width: '100%',
            display: status === 'rendered' ? 'block' : 'none',
          }}
        >
          <MermaidDiagram code={code} onStatus={handleStatus} />
        </div>
      </div>

      {caption && <figcaption className="hb-diagram__cap">{caption}</figcaption>}
    </figure>
  )
}
