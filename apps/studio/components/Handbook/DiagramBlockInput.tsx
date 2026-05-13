import React, { useEffect, useId, useRef, useState } from 'react'
import type { ObjectInputProps } from 'sanity'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'neutral' })

export function DiagramBlockInput(props: ObjectInputProps): React.JSX.Element {
  const { renderDefault, value } = props
  const uid = useId().replace(/:/g, 'x')
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // code field is type:'code' (code-input), value is { _type:'code', code:string }
  // fall back to plain string if somehow stored as text
  const raw = (value as Record<string, unknown> | undefined)?.code
  const codeString: string =
    typeof raw === 'string' ? raw : (raw as Record<string, unknown> | undefined)?.code as string ?? ''

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!codeString.trim()) {
      setSvg('')
      setError('')
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { svg: rendered } = await mermaid.render(`mermaid-${uid}`, codeString.trim())
        setSvg(rendered)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setSvg('')
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [codeString, uid])

  return (
    <div>
      {renderDefault(props)}

      <div
        style={{
          marginTop: 16,
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
          }}
        >
          Live preview
        </div>
        <div style={{ padding: 20, minHeight: 80, background: '#fff' }}>
          {error ? (
            <pre
              style={{
                color: '#dc2626',
                fontSize: 12,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {error}
            </pre>
          ) : svg ? (
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              style={{ maxWidth: '100%', overflowX: 'auto' }}
            />
          ) : (
            <div style={{ color: '#9ca3af', fontSize: 13 }}>
              Start typing Mermaid code to see a live preview…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
