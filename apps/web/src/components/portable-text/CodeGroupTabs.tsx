'use client'

import React, { useState } from 'react'
import { CopyButton } from './CopyButton'

interface Tab {
  label: string
  filename: string | null
  code: string
  html: { light: string; dark: string }
}

export function CodeGroupTabs({ tabs }: { tabs: Tab[] }): React.JSX.Element {
  const [active, setActive] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setActive((index + 1) % tabs.length)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setActive((index - 1 + tabs.length) % tabs.length)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActive(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActive(tabs.length - 1)
    }
  }

  const activeTab = tabs[active]

  return (
    <div className="hb-codeblock">
      {/* Tab bar */}
      <div className="hb-codegroup__tabs" role="tablist" aria-label="Code snippets">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`codegroup-panel-${i}`}
            id={`codegroup-tab-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`hb-codegroup__tab${i === active ? ' is-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
        {/* Copy button for the active tab — pinned to the right */}
        {activeTab && (
          <CopyButton
            key={active}
            code={activeTab.code}
            className="hb-codeblock__copy"
            style={{ marginLeft: 'auto' }}
          />
        )}
      </div>

      {/* Tab panels */}
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`codegroup-panel-${i}`}
          aria-labelledby={`codegroup-tab-${i}`}
          hidden={i !== active}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: tab.html.dark }}
        />
      ))}
    </div>
  )
}
