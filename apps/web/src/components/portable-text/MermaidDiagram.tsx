'use client'

import { useEffect, useRef, useState } from 'react'

export function MermaidDiagram({ code }: { code: string }): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'strict',
          fontFamily: 'inherit',
        })
        // Unique ID required by mermaid.render()
        const id = `mermaid-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, code)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          // Make the generated SVG responsive
          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            svgEl.removeAttribute('height')
            svgEl.style.maxWidth = '100%'
            svgEl.style.height = 'auto'
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Render failed')
        }
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [code])

  if (error) {
    return (
      <pre
        aria-label="Mermaid diagram source (render failed)"
        style={{
          margin: 0,
          padding: '12px 16px',
          fontSize: 12,
          fontFamily: 'ui-monospace, monospace',
          lineHeight: 1.6,
          background: 'var(--color-bg-subtle, #f6f8fa)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
          color: 'var(--color-text)',
        }}
      >
        {code}
      </pre>
    )
  }

  return (
    <div
      ref={containerRef}
      aria-label="Diagram"
      style={{ overflowX: 'auto', lineHeight: 1 }}
    />
  )
}
