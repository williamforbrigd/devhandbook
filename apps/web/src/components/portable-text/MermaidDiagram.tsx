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
          theme: 'base',
          themeVariables: {
            // ── Handbook palette ──────────────────────────────────────
            primaryColor:        '#eeefff',  // --hb-inline-code-bg
            primaryTextColor:    '#202285',  // --hb-inline-code-fg
            primaryBorderColor:  '#b9bbff',  // --hb-accent-soft
            lineColor:           '#3d41ff',  // --hb-accent
            secondaryColor:      '#f4f4fc',
            tertiaryColor:       '#ffffff',
            // Sequence diagrams
            actorBkg:            '#eeefff',
            actorBorder:         '#b9bbff',
            actorTextColor:      '#202285',
            actorLineColor:      '#8a8d97',
            signalColor:         '#3d41ff',
            signalTextColor:     '#111827',
            labelBoxBkgColor:    '#eeefff',
            labelBoxBorderColor: '#b9bbff',
            labelTextColor:      '#202285',
            loopTextColor:       '#202285',
            noteBorderColor:     '#b9bbff',
            noteBkgColor:        '#f4f4ff',
            noteTextColor:       '#202285',
            activationBorderColor: '#3d41ff',
            activationBkgColor:  '#dfe0ff',
            fontFamily:          'inherit',
          },
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
            svgEl.classList.add('hb-seqsvg')
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
