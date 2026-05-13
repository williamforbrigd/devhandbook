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
}

const TocContext = createContext<TocContextValue>({ setItems: () => undefined })

export function useToc() {
  return useContext(TocContext)
}

// ── Provider (wraps the whole app inside ThemeProvider) ───────────────────────

export function TocProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [items, setItems] = useState<TocItem[]>([])

  return (
    <TocContext.Provider value={{ setItems }}>
      {children}
      <TocSidebarPortal items={items} />
    </TocContext.Provider>
  )
}

// ── Portal: renders ToC into the #toc-sidebar aside in layout ─────────────────

function TocSidebarPortal({ items }: { items: TocItem[] }): React.JSX.Element | null {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(document.getElementById('toc-sidebar'))
  }, [])

  if (!container || items.length === 0) return null
  return createPortal(<TableOfContents items={items} />, container)
}

// ── Hook: article pages call this to register their headings ──────────────────

export function TocRegistrar({ items }: { items: TocItem[] }): null {
  const { setItems } = useToc()
  const itemsRef = useRef(items)

  useEffect(() => {
    setItems(itemsRef.current)
    return () => setItems([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export type { TocItem }
export { TableOfContentsMobile }
