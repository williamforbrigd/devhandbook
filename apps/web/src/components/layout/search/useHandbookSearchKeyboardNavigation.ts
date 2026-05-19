'use client'

import { useCallback, useState } from 'react'
import type React from 'react'
import type { HandbookSearchResult } from '../../../lib/search/handbookSearch'

interface UseHandbookSearchKeyboardNavigationProps {
  results: HandbookSearchResult[]
  enabled: boolean
  onNavigate: (result: HandbookSearchResult) => void
  onEscape: () => void
  onSubmit: () => void
}

export function useHandbookSearchKeyboardNavigation({
  results,
  enabled,
  onNavigate,
  onEscape,
  onSubmit,
}: UseHandbookSearchKeyboardNavigationProps): {
  activeIndex: number
  setActiveIndex: (index: number) => void
  resetActiveIndex: () => void
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
} {
  const [activeIndex, setActiveIndex] = useState(-1)

  const resetActiveIndex = useCallback(() => setActiveIndex(-1), [])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!enabled && event.key !== 'Enter') return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (results.length === 0) return
        setActiveIndex((current) => (current + 1 >= results.length ? 0 : current + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (results.length === 0) return
        setActiveIndex((current) => (current - 1 < 0 ? results.length - 1 : current - 1))
        break
      case 'Enter':
        event.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          onNavigate(results[activeIndex]!)
        } else {
          onSubmit()
        }
        break
      case 'Escape':
        event.preventDefault()
        resetActiveIndex()
        onEscape()
        break
      default:
        if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
          resetActiveIndex()
        }
    }
  }, [activeIndex, enabled, onEscape, onNavigate, onSubmit, resetActiveIndex, results])

  return { activeIndex, setActiveIndex, resetActiveIndex, handleKeyDown }
}