'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '../ui/Icon'
import { APP_VERSION_LABEL } from '../../lib/version'
import type { NavGroup, NavItem, Expertise, NavigationData, SidebarGuide, MethodNavigationData, MethodNavigationDomain, MethodNavigationMethod } from '../../lib/queries'

// ── Brand block (top of sidebar) ──────────────────────────────────────────────

function SidebarBrand(): React.JSX.Element {
  return (
    <div className="hb-side__brand" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <Link href="/" className="hb-side__wordmark" aria-label="Dev Handbook home">
        <span>Handbook</span>
      </Link>
      <div className="hb-side__sub">Internal {APP_VERSION_LABEL}</div>
    </div>
  )
}

// ── Expertise filter ──────────────────────────────────────────────────────────

function ExpertiseFilter({
  expertises,
  selected,
  onToggle,
  onClear,
}: {
  expertises: Expertise[]
  selected: Set<string>
  onToggle: (slug: string) => void
  onClear: () => void
}) {
  if (expertises.length === 0) return null
  return (
    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--hb-border)' }}>
      <div className="hb-side__sectionlabel" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name="filter" size={11} style={{ opacity: 0.6 }} />
        Filter by expertise
      </div>
      <div className="hb-chips">
        {expertises.map((e) => {
          const active = selected.has(e.slug)
          return (
            <button
              key={e.slug}
              type="button"
              onClick={() => onToggle(e.slug)}
              className={`hb-chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
            >
              {e.title}
            </button>
          )
        })}
        {selected.size > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="hb-chip"
            style={{ borderStyle: 'dashed' }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItemLink({
  item,
  activeFilter,
  onNavigate,
}: {
  item: NavItem
  activeFilter: Set<string>
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const article = item.article
  if (!article?.section?.slug) return null

  // Filter: hide if filter active and article doesn't have matching expertise
  if (activeFilter.size > 0) {
    const expertises = article.expertises ?? []
    const matches = expertises.some((e) => activeFilter.has(e))
    if (!matches) return null
  }

  const href = `/${article.section.slug}/${article.slug}`
  const isActive = pathname === href

  return (
    <Link href={href} className={`hb-nav__item${isActive ? ' is-active' : ''}`} onClick={onNavigate}>
      {article.title}
    </Link>
  )
}

// ── Nav group (recursive) ─────────────────────────────────────────────────────

function groupHasVisibleItems(group: NavGroup, filter: Set<string>): boolean {
  if (filter.size === 0) return true
  return (group.items ?? []).filter(Boolean).some((item) => {
    if (item._type === 'navItem') {
      const article = (item as NavItem).article
      if (!article?.section?.slug) return false
      return (article.expertises ?? []).some((e) => filter.has(e))
    }
    return groupHasVisibleItems(item as NavGroup, filter)
  })
}

function NavGroupSection({
  group,
  depth,
  activeFilter,
  onNavigate,
}: {
  group: NavGroup
  depth: number
  activeFilter: Set<string>
  onNavigate?: () => void
}) {
  const storageKey = `nav-open-${group.title}`
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored !== null) setOpen(stored !== 'false')
  }, [storageKey])

  const toggle = () => {
    const next = !open
    setOpen(next)
    localStorage.setItem(storageKey, String(next))
  }

  if (!groupHasVisibleItems(group, activeFilter)) return null

  return (
    <div className="hb-nav__group" style={depth > 0 ? { paddingLeft: 12 } : undefined}>
      <button
        type="button"
        onClick={toggle}
        className="hb-nav__grouphead"
        aria-expanded={open}
      >
        <span
          className="hb-nav__caret"
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        >
          <Icon name="chevronRight" size={12} />
        </span>
        <span>{group.title}</span>
      </button>
      {open && (
        <div className="hb-nav__items">
          {(group.items ?? []).filter(Boolean).map((item, i) =>
            item._type === 'navItem' ? (
              <NavItemLink key={i} item={item as NavItem} activeFilter={activeFilter} onNavigate={onNavigate} />
            ) : (
              <NavGroupSection
                key={i}
                group={item as NavGroup}
                depth={depth + 1}
                activeFilter={activeFilter}
                onNavigate={onNavigate}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}

// ── Sidebar mode switcher ─────────────────────────────────────────────────────

function SwitcherPill({
  mode,
  onChange,
  articleCount,
  guideCount,
}: {
  mode: 'articles' | 'guides'
  onChange: (m: 'articles' | 'guides') => void
  articleCount: number
  guideCount: number
}) {
  return (
    <div className="hb-side__switcher" role="tablist" aria-label="Browse mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'articles'}
        className={mode === 'articles' ? 'is-active' : ''}
        onClick={() => onChange('articles')}
      >
        <Icon name="fileText" size={11} />
        Artikler
        <span className="hb-side__switcher__count">{articleCount}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'guides'}
        className={mode === 'guides' ? 'is-active' : ''}
        onClick={() => onChange('guides')}
      >
        <Icon name="map" size={11} />
        Guides
        <span className="hb-side__switcher__count">{guideCount}</span>
      </button>
    </div>
  )
}

// ── Guides flat list (sidebar guides mode) ────────────────────────────────────

function GuidesFlatList({
  guides,
}: {
  guides: SidebarGuide[]
}) {
  const pathname = usePathname()

  // Group guides by first role (or "Annet" if no roles)
  const groups = new Map<string, SidebarGuide[]>()
  for (const g of guides) {
    const groupName = (g.roles ?? [])[0]?.title ?? 'Annet'
    const existing = groups.get(groupName) ?? []
    existing.push(g)
    groups.set(groupName, existing)
  }

  if (guides.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--hb-fg-muted)', padding: '8px 8px' }}>No guides yet.</p>
  }

  return (
    <div className="hb-glist">
      {Array.from(groups.entries()).map(([groupName, items]) => (
        <React.Fragment key={groupName}>
          <div className="hb-glist__group">{groupName}</div>
          {items.map((g) => {
            const href = `/guides/${g.slug}`
            const isActive = pathname === href
            return (
              <Link
                key={g._id}
                href={href}
                className={`hb-glist__item${isActive ? ' is-active' : ''}`}
              >
                <span className="hb-glist__row">
                  <Icon name="map" size={11} style={{ flex: 'none' }} />
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.title}
                  </span>
                  {g.phaseCount > 0 && (
                    <span className="hb-glist__phases" aria-label={`${g.phaseCount} faser`}>
                      {Array.from({ length: Math.min(g.phaseCount, 5) }).map((_, i) => (
                        <span key={i} />
                      ))}
                    </span>
                  )}
                </span>
                {g.sectionTitle && (
                  <span className="hb-glist__meta">{g.sectionTitle}</span>
                )}
              </Link>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}

function MethodNavItem({ method, onNavigate }: { method: MethodNavigationMethod; onNavigate?: () => void }) {
  const pathname = usePathname()
  const href = `/methods/${method.domain.slug}/${method.slug}`
  const isActive = pathname === href

  return (
    <div className="hb-method-nav__itemwrap">
      <Link href={href} className={`hb-nav__item${isActive ? ' is-active' : ''}`} onClick={onNavigate}>
        {method.title}
      </Link>
      {(method.subMethods ?? []).length > 0 && (
        <div className="hb-method-nav__children">
          {method.subMethods.map((subMethod) => {
            const subHref = `/methods/${subMethod.domain.slug}/${subMethod.slug}`
            return (
              <Link
                key={subMethod._id}
                href={subHref}
                className={`hb-nav__item${pathname === subHref ? ' is-active' : ''}`}
                onClick={onNavigate}
              >
                {subMethod.title}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MethodDomainSection({ domain, onNavigate }: { domain: MethodNavigationDomain; onNavigate?: () => void }) {
  const pathname = usePathname()
  const storageKey = `method-nav-open-${domain.slug}`
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored !== null) setOpen(stored !== 'false')
  }, [storageKey])

  const toggle = () => {
    const next = !open
    setOpen(next)
    localStorage.setItem(storageKey, String(next))
  }

  return (
    <div className="hb-nav__group hb-method-nav__domain">
      <button type="button" onClick={toggle} className="hb-nav__grouphead" aria-expanded={open}>
        <span
          className="hb-nav__caret"
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
          }}
        >
          <Icon name="chevronRight" size={12} />
        </span>
        <span>{domain.title}</span>
      </button>
      {open && (
        <div className="hb-nav__items">
          <Link
            href={`/methods/${domain.slug}`}
            className={`hb-nav__item${pathname === `/methods/${domain.slug}` ? ' is-active' : ''}`}
            onClick={onNavigate}
          >
            Overview
          </Link>
          {(domain.methods ?? []).map((method) => (
            <MethodNavItem key={method._id} method={method} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

function MethodsNav({ methodNavigation, onNavigate }: { methodNavigation: MethodNavigationData; onNavigate?: () => void }) {
  const pathname = usePathname()
  const domains = methodNavigation.domains ?? []

  if (domains.length === 0) return null

  return (
    <nav className="hb-nav hb-method-nav" aria-label="Method navigation">
      <div className="hb-method-nav__divider" />
      <Link
        href="/methods"
        className={`hb-method-nav__root${pathname === '/methods' ? ' is-active' : ''}`}
        onClick={onNavigate}
      >
        <Icon name="compass" size={14} />
        <span>Methods</span>
      </Link>
      {domains.map((domain) => (
        <MethodDomainSection key={domain._id} domain={domain} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

// ── Sidebar content ───────────────────────────────────────────────────────────

export function SidebarContent({
  navigation,
  expertises,
  guides,
  methodNavigation,
  onNavigate,
}: {
  navigation: NavigationData | null
  expertises: Expertise[]
  guides: SidebarGuide[]
  methodNavigation: MethodNavigationData
  onNavigate?: () => void
}): React.JSX.Element {
  const [selectedExpertises, setSelectedExpertises] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<'articles' | 'guides'>('articles')
  const pathname = usePathname()

  // Count total nav items for the switcher pill
  const articleCount = React.useMemo(() => {
    function countItems(groups: NavGroup[]): number {
      let n = 0
      for (const g of groups) {
        for (const item of g.items ?? []) {
          if (item._type === 'navItem') n++
          else n += countItems([item as NavGroup])
        }
      }
      return n
    }
    return countItems(navigation?.groups ?? [])
  }, [navigation])

  const toggleExpertise = useCallback((slug: string) => {
    setSelectedExpertises((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  const clearExpertises = useCallback(() => setSelectedExpertises(new Set()), [])

  const segments = pathname.split('/').filter(Boolean)
  const topLevelRoutes = ['guides', 'ai-skills', 'glossary', 'sections', 'principles', 'design']
  const isArticlePage = segments.length === 2 && !topLevelRoutes.includes(segments[0] ?? '')

  const showSwitcher = guides.length > 0

  return (
    <aside className="hb-side" aria-label="Sidebar">
      <SidebarBrand />
      {showSwitcher && (
        <SwitcherPill
          mode={mode}
          onChange={setMode}
          articleCount={articleCount}
          guideCount={guides.length}
        />
      )}
      {mode === 'articles' && isArticlePage && (
        <ExpertiseFilter
          expertises={expertises}
          selected={selectedExpertises}
          onToggle={toggleExpertise}
          onClear={clearExpertises}
        />
      )}
      {mode === 'articles' && (
        <nav className="hb-nav" aria-label="Site navigation">
          {navigation?.groups.map((group, i) => (
            <NavGroupSection
              key={i}
              group={group}
              depth={0}
              activeFilter={selectedExpertises}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      )}
      {mode === 'guides' && (
        <nav className="hb-nav" aria-label="Guides navigation">
          <div className="hb-side__sectionlabel" style={{ margin: '4px 8px 8px' }}>
            Guides — by role
          </div>
          <GuidesFlatList guides={guides} />
        </nav>
      )}
      <MethodsNav methodNavigation={methodNavigation} onNavigate={onNavigate} />
      <nav className="hb-side__utility" aria-label="Handbook utilities">
        <Link
          href="/glossary"
          className={`hb-side__utility-link${pathname === '/glossary' ? ' is-active' : ''}`}
          onClick={onNavigate}
        >
          <Icon name="bookOpen" size={16} />
          <span>Glossary</span>
        </Link>
      </nav>
    </aside>
  )
}

// ── Mobile drawer ──────────────────────────────────────────────────────────────

export function MobileMenuButton({ onClick }: { onClick: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open navigation"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 16,
        zIndex: 40,
        padding: '10px 14px',
        background: '#1d4ed8',
        color: '#fff',
        border: 'none',
        borderRadius: 99,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 16 }}>☰</span> Menu
    </button>
  )
}

export function MobileDrawer({
  open,
  onClose,
  navigation,
  expertises,
  guides,
  methodNavigation,
}: {
  open: boolean
  onClose: () => void
  navigation: NavigationData | null
  expertises: Expertise[]
  guides: SidebarGuide[]
  methodNavigation: MethodNavigationData
}): React.JSX.Element {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
          }}
        />
      )}
      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 35,
          width: 280,
          background: 'var(--color-bg, #fff)',
          borderRight: '1px solid var(--color-border, #e5e7eb)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          overflowY: 'auto',
          paddingTop: 56,
        }}
      >
        <SidebarContent navigation={navigation} expertises={expertises} guides={guides} methodNavigation={methodNavigation} onNavigate={onClose} />
      </div>
    </>
  )
}
