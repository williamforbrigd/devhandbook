'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { TableOfContents, TableOfContentsMobile } from './TableOfContents'
import type { TocItem } from './TableOfContents'

// ── Context ───────────────────────────────────────────────────────────────────

interface TocContextValue {
  setItems: (items: TocItem[]) => void
  setReadingMinutes: (minutes: number) => void
}

const TocContext = createContext<TocContextValue>({
  setItems: () => undefined,
  setReadingMinutes: () => undefined,
})

export function useToc() {
  return useContext(TocContext)
}

// ── Provider (wraps the whole app inside ThemeProvider) ───────────────────────

export function TocProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [items, setItems] = useState<TocItem[]>([])
  const [readingMinutes, setReadingMinutes] = useState<number>(0)

  return (
    <TocContext.Provider value={{ setItems, setReadingMinutes }}>
      {children}
      <TocSidebarPortal items={items} readingMinutes={readingMinutes} />
    </TocContext.Provider>
  )
}

// ── Portal: renders ToC into the #toc-sidebar aside in layout ─────────────────

function TocSidebarPortal({ items, readingMinutes }: { items: TocItem[]; readingMinutes: number }): React.JSX.Element | null {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(document.getElementById('toc-sidebar'))
  }, [])

  if (!container || items.length === 0) return null
  return createPortal(<TableOfContents items={items} readingMinutes={readingMinutes} />, container)
}

// ── Hook: article pages call this to register their headings ──────────────────

export function TocRegistrar({ items, readingMinutes = 0 }: { items: TocItem[]; readingMinutes?: number }): null {
  const { setItems, setReadingMinutes } = useToc()
  const itemsRef = useRef(items)

  useEffect(() => {
    setItems(itemsRef.current)
    setReadingMinutes(readingMinutes)
    return () => { setItems([]); setReadingMinutes(0) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export type { TocItem }
export { TableOfContentsMobile }
