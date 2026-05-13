'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => undefined,
  resolvedTheme: 'light',
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('handbook-theme') as Theme | null
    if (stored) setThemeState(stored)
  }, [])

  useEffect(() => {
    const apply = (t: Theme) => {
      const isDark =
        t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', isDark)
      setResolvedTheme(isDark ? 'dark' : 'light')
    }

    apply(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (t: Theme) => {
    localStorage.setItem('handbook-theme', t)
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
