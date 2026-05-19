import React from 'react'
import { CopyButton } from './CopyButton'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CodeBlock({ value }: { value: any }): React.JSX.Element {
  const code: string             = value?.__code           ?? value?.code?.code ?? value?.code ?? ''
  const language: string         = value?.__language       ?? 'text'
  const filename: string | null  = value?.__filename       ?? null
  const showLineNumbers: boolean = value?.__showLineNumbers ?? true
  const darkHtml: string         = value?.__darkHtml       ?? ''

  if (!darkHtml) return <></>

  return (
    <div
      className="hb-codeblock"
      data-show-line-numbers={showLineNumbers ? '' : undefined}
    >
      <div className="hb-codeblock__head">
        <span className="hb-codeblock__filename">{filename ?? language}</span>
        <CopyButton code={code} className="hb-codeblock__copy" />
      </div>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: darkHtml }} />
    </div>
  )
}
