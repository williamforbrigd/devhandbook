import React from 'react'
import { type StringInputProps } from 'sanity'

export function HighlightLinesInput(props: StringInputProps): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {props.renderDefault(props)}
      <span style={{ fontSize: 12, color: '#6b7280' }}>
        Comma-separated line numbers or ranges, e.g. <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3, fontFamily: 'monospace' }}>1,3-5,8</code>
      </span>
    </div>
  )
}
