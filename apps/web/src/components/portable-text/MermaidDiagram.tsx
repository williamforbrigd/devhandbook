'use client'

import { useEffect, useRef } from 'react'

export type MermaidStatus = 'loading' | 'rendered' | 'error'

interface MermaidDiagramProps {
  code: string
  /** Called whenever the render state changes. */
  onStatus?: (status: MermaidStatus, error?: string) => void
}

/**
 * Renders a Mermaid diagram into an inline SVG. The component is purely a
 * renderer — it does not wrap itself in any chrome. Parents use `onStatus`
 * to swap in loading or error fallbacks. The element itself stays mounted
 * even on error, so Mermaid retries cleanly if `code` changes.
 */
export function MermaidDiagram({
  code,
  onStatus,
}: MermaidDiagramProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    onStatus?.('loading')

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
        if (cancelled) return
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          // Make the generated SVG responsive
          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            svgEl.removeAttribute('height')
            svgEl.style.maxWidth = '100%'
            svgEl.style.height = 'auto'
          }
        }
        onStatus?.('rendered')
      } catch (e) {
        if (cancelled) return
        if (containerRef.current) containerRef.current.innerHTML = ''
        onStatus?.('error', e instanceof Error ? e.message : 'Render failed')
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [code, onStatus])

  return (
    <div
      ref={containerRef}
      aria-label="Diagram"
      style={{ width: '100%', overflowX: 'auto', lineHeight: 1 }}
    />
  )
}
