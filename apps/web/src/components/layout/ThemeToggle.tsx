'use client'

import React from 'react'
import { useTheme } from './ThemeProvider'
import { Icon } from '../ui/Icon'

export function ThemeToggle(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  return (
    <div className="hb-tt3" role="group" aria-label="Theme">
      <button
        type="button"
        className={theme === 'light' ? 'is-on' : ''}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="Light theme"
        title="Light"
      >
        <Icon name="sun" size={14} />
      </button>
      <button
        type="button"
        className={theme === 'system' ? 'is-on' : ''}
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
        aria-label="System theme"
        title="System"
      >
        <Icon name="monitor" size={14} />
      </button>
      <button
        type="button"
        className={theme === 'dark' ? 'is-on' : ''}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Dark theme"
        title="Dark"
      >
        <Icon name="moon" size={14} />
      </button>
    </div>
  )
}
