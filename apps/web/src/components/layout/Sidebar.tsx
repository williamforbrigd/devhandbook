'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavGroup, NavItem, Expertise, NavigationData } from '../../lib/queries'

// ── Expertise filter ──────────────────────────────────────────────────────────

function ExpertiseFilter({
  expertises,
  selected,
  onToggle,
}: {
  expertises: Expertise[]
  selected: Set<string>
  onToggle: (slug: string) => void
}) {
  if (expertises.length === 0) return null
  return (
    <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 6 }}>
        Filter by expertise
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {expertises.map((e) => {
          const active = selected.has(e.slug)
          return (
            <button
              key={e.slug}
              type="button"
              onClick={() => onToggle(e.slug)}
              style={{
                padding: '2px 8px',
                borderRadius: 99,
                border: `1px solid ${active ? '#1d4ed8' : 'var(--color-border, #e5e7eb)'}`,
                background: active ? '#dbeafe' : 'transparent',
                color: active ? '#1d4ed8' : '#6b7280',
                fontSize: 11,
                fontWeight: active ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {e.title}
            </button>
          )
        })}
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => expertises.forEach((e) => selected.has(e.slug) && onToggle(e.slug))}
            style={{ padding: '2px 6px', fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItemLink({ item, activeFilter }: { item: NavItem; activeFilter: Set<string> }) {
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
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '4px 12px 4px 16px',
        fontSize: 13,
        color: isActive ? '#1d4ed8' : 'var(--color-text, #374151)',
        background: isActive ? '#eff6ff' : 'transparent',
        borderRadius: 4,
        textDecoration: 'none',
        fontWeight: isActive ? 600 : 400,
        borderLeft: `2px solid ${isActive ? '#1d4ed8' : 'transparent'}`,
      }}
    >
      {article.title}
    </Link>
  )
}

// ── Nav group (recursive) ─────────────────────────────────────────────────────

function NavGroupSection({
  group,
  depth,
  activeFilter,
}: {
  group: NavGroup
  depth: number
  activeFilter: Set<string>
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

  const paddingLeft = 16 + depth * 12

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: `6px ${paddingLeft}px`,
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: depth === 0 ? 12 : 11,
          fontWeight: 700,
          textTransform: depth === 0 ? 'uppercase' : 'none',
          letterSpacing: depth === 0 ? '0.06em' : '0',
          color: depth === 0 ? '#6b7280' : 'var(--color-text, #374151)',
        }}
      >
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.15s', fontSize: 10, color: '#9ca3af' }}>▶</span>
        {group.title}
      </button>
      {open && (
        <div style={{ marginBottom: depth === 0 ? 8 : 2 }}>
          {(group.items ?? []).filter(Boolean).map((item, i) =>
            item._type === 'navItem' ? (
              <NavItemLink key={i} item={item as NavItem} activeFilter={activeFilter} />
            ) : (
              <NavGroupSection key={i} group={item as NavGroup} depth={depth + 1} activeFilter={activeFilter} />
            ),
          )}
        </div>
      )}
    </div>
  )
}

// ── Sidebar content ───────────────────────────────────────────────────────────

export function SidebarContent({
  navigation,
  expertises,
}: {
  navigation: NavigationData | null
  expertises: Expertise[]
}): React.JSX.Element {
  const [selectedExpertises, setSelectedExpertises] = useState<Set<string>>(new Set())

  const toggleExpertise = useCallback((slug: string) => {
    setSelectedExpertises((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ExpertiseFilter
        expertises={expertises}
        selected={selectedExpertises}
        onToggle={toggleExpertise}
      />
      <nav
        style={{ flex: 1, overflowY: 'auto', padding: '8px 0 24px' }}
        aria-label="Site navigation"
      >
        {navigation?.groups.map((group, i) => (
          <NavGroupSection key={i} group={group} depth={0} activeFilter={selectedExpertises} />
        ))}
      </nav>
    </div>
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
}: {
  open: boolean
  onClose: () => void
  navigation: NavigationData | null
  expertises: Expertise[]
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
        <SidebarContent navigation={navigation} expertises={expertises} />
      </div>
    </>
  )
}
