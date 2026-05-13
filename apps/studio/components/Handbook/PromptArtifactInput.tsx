import React, { useMemo } from 'react'
import type { ObjectInputProps } from 'sanity'

interface Variable {
  name?: string
  description?: string
  example?: string
}

interface PromptArtifactValue {
  userPromptTemplate?: { code?: string }
  variables?: Variable[]
}

export function PromptArtifactInput(props: ObjectInputProps): React.JSX.Element {
  const value = props.value as PromptArtifactValue | undefined
  const template = value?.userPromptTemplate?.code ?? ''
  const variables = value?.variables ?? []

  const preview = useMemo(() => {
    if (!template || variables.length === 0) return null
    let result = template
    for (const v of variables) {
      if (v.name && v.example) {
        result = result.replaceAll(`{{${v.name}}}`, `**${v.example}**`)
        result = result.replaceAll(`{${v.name}}`, `**${v.example}**`)
      }
    }
    return result === template ? null : result
  }, [template, variables])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {props.renderDefault(props)}

      {preview && (
        <div
          style={{
            marginTop: 4,
            padding: 12,
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#16a34a', marginBottom: 6, letterSpacing: '0.05em' }}>
            Preview with example values
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: 'monospace',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#111827',
              lineHeight: 1.6,
            }}
          >
            {preview}
          </pre>
        </div>
      )}

      {template && variables.length === 0 && (
        <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
          Add variables above to see a preview with example values substituted into the template.
        </div>
      )}
    </div>
  )
}
