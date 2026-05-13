'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { SearchDialog } from './SearchDialog'
import { useTheme } from './ThemeProvider'

export function Header(): React.JSX.Element {
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const themeIcon = theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid var(--color-border, #e5e7eb)',
          background: 'var(--color-bg, #fff)',
          gap: 16,
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-text, #111827)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Handbook
        </Link>

        <div style={{ flex: 1 }} />

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 8,
            background: 'var(--color-surface, #f9fafb)',
            cursor: 'pointer',
            fontSize: 13,
            color: '#6b7280',
            minWidth: 160,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <span>Search…</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.6 }}>⌘K</span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} mode`}
          title={`Current: ${theme} — click for ${nextTheme}`}
          style={{
            padding: '5px 8px',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 15,
            lineHeight: 1,
            color: 'inherit',
          }}
        >
          {themeIcon}
        </button>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
