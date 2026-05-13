'use client'

import React, { useState } from 'react'

interface Tab {
  label: string
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

  return (
    <div
      style={{
        margin: '1.25rem 0',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        fontSize: 13,
      }}
    >
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Code snippets"
        style={{
          display: 'flex',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}
      >
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
            style={{
              padding: '6px 14px',
              fontSize: 11,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: i === active ? 600 : 400,
              color: i === active ? 'var(--color-text)' : 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: i === active ? '2px solid var(--color-link)' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`codegroup-panel-${i}`}
          aria-labelledby={`codegroup-tab-${i}`}
          hidden={i !== active}
        >
          <div className="shiki-wrapper" style={{ overflowX: 'auto' }}>
            <div
              className="shiki-light"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: tab.html.light }}
            />
            <div
              className="shiki-dark"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: tab.html.dark }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
