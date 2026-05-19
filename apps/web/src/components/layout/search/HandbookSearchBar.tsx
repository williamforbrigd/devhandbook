'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { HandbookSearchResult } from '../../../lib/search/handbookSearch'
import { Icon } from '../../ui/Icon'
import { useHandbookSearch } from './useHandbookSearch'
import { useHandbookSearchKeyboardNavigation } from './useHandbookSearchKeyboardNavigation'
import { HandbookSearchDropdown } from './HandbookSearchDropdown'
import styles from './HandbookSearch.module.css'

interface HandbookSearchBarProps {
  variant?: 'compact' | 'wide'
  placeholder?: string
  className?: string
}

export function HandbookSearchBar({
  variant = 'compact',
  placeholder = 'Søk etter artikler, mønstre, beslutninger…',
  className,
}: HandbookSearchBarProps): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const isSearchPage = pathname === '/search'
  const limit = variant === 'wide' ? 5 : 5
  const { results, loading, error } = useHandbookSearch(query, limit)
  const trimmedQuery = query.trim()
  const showDropdown = !isSearchPage && open && trimmedQuery.length >= 2
  const rootClassName = [styles.root, styles[variant], className].filter(Boolean).join(' ')

  const navigateToResult = (result: HandbookSearchResult) => {
    setOpen(false)
    setQuery('')
    router.push(result.href)
  }

  const goToSearchPage = () => {
    if (!trimmedQuery) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
  }

  const {
    activeIndex,
    setActiveIndex,
    resetActiveIndex,
    handleKeyDown,
  } = useHandbookSearchKeyboardNavigation({
    results,
    enabled: showDropdown,
    onNavigate: navigateToResult,
    onEscape: () => setOpen(false),
    onSubmit: goToSearchPage,
  })

  useEffect(() => {
    resetActiveIndex()
    setOpen(false)
    setQuery('')
  }, [pathname, resetActiveIndex])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        resetActiveIndex()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [resetActiveIndex])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <div
      ref={containerRef}
      className={rootClassName}
    >
      <form
        className={styles.form}
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          goToSearchPage()
        }}
      >
        <Icon name="search" size={variant === 'wide' ? 16 : 14} className={styles.icon} />
        <input
          ref={inputRef}
          data-handbook-search-input={variant}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={styles.input}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? 'handbook-search-results' : undefined}
          aria-activedescendant={activeIndex >= 0 ? `handbook-search-result-${activeIndex}` : undefined}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Tøm søk"
            onClick={() => {
              setQuery('')
              resetActiveIndex()
              inputRef.current?.focus()
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}
        {!query && <kbd className={styles.kbd}>⌘K</kbd>}
      </form>

      {showDropdown && (
        <HandbookSearchDropdown
          query={query}
          results={results}
          loading={loading}
          error={error}
          activeIndex={activeIndex}
          onResultClick={() => {
            setOpen(false)
            setQuery('')
          }}
          onActiveIndexChange={setActiveIndex}
          onViewAll={goToSearchPage}
        />
      )}
    </div>
  )
}