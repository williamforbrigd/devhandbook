import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Pill } from '../../../components/ui/Pill'
import { Avatar } from '../../../components/ui/Avatar'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Icon } from '../../../components/ui/Icon'
import { MaturityBadge } from '../../../components/article/MaturityBadge'
import { ArticleBanner } from '../../../components/article/ArticleBanner'
import { LivingDocBanner } from '../../../components/guide/LivingDocBanner'

export const metadata: Metadata = {
  title: 'Design system · Components',
  description: 'Showcase of components used in the developer handbook.',
}

// ── Local helpers (page-only) ────────────────────────────────────────────────

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section id={id} style={{ margin: '40px 0' }}>
      <h2 style={{ marginBottom: 4 }}>{title}</h2>
      {description && (
        <p style={{ marginTop: 0, color: 'var(--hb-fg-3)', fontSize: 14 }}>
          {description}
        </p>
      )}
      <div
        style={{
          marginTop: 16,
          padding: 20,
          border: '1px solid var(--hb-border)',
          borderRadius: 8,
          background: 'var(--hb-bg)',
        }}
      >
        {children}
      </div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {children}
    </div>
  )
}

function Stack({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {children}
    </div>
  )
}

const SHOWCASE_ICONS = [
  'search', 'bookOpen', 'home', 'edit', 'check', 'copy', 'sparkles',
  'lightbulb', 'sun', 'moon', 'rocket', 'palette', 'code', 'database',
  'fileText', 'folder', 'star', 'heart', 'shield', 'globe',
]

const NAV: Array<{ id: string; label: string }> = [
  { id: 'typography', label: 'Typography' },
  { id: 'pills', label: 'Pill' },
  { id: 'maturity', label: 'Maturity badges' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'icons', label: 'Icons' },
  { id: 'empty', label: 'Empty state' },
  { id: 'banners', label: 'Article banners' },
  { id: 'livingdoc', label: 'Living-doc banner' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ComponentsShowcasePage(): React.JSX.Element {
  return (
    <article>
      <header>
        <Pill>Design system</Pill>
        <h1 style={{ marginTop: 8 }}>Components</h1>
        <p style={{ color: 'var(--hb-fg-2)', marginTop: 4 }}>
          Live preview of the shared React components and how they render against
          the handbook design system. Use this page when verifying visual changes
          to <code>handbook.css</code>.
        </p>

        <nav
          aria-label="On this page"
          style={{
            marginTop: 16,
            padding: '10px 14px',
            background: 'var(--hb-bg-soft)',
            border: '1px solid var(--hb-border)',
            borderRadius: 8,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 14px',
            fontSize: 13,
          }}
        >
          {NAV.map((n) => (
            <Link key={n.id} href={`#${n.id}`} style={{ color: 'var(--hb-accent)' }}>
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <Section
        id="typography"
        title="Typography"
        description="Default heading and prose styles inherited from the design system."
      >
        <Stack>
          <h1 style={{ margin: 0 }}>Heading 1</h1>
          <h2 style={{ margin: 0 }}>Heading 2</h2>
          <h3 style={{ margin: 0 }}>Heading 3</h3>
          <p style={{ margin: 0 }}>
            Body text — Lasso devhandbook uses Norwegian for content but ships{' '}
            <a href="#">links</a>, <code>inline code</code> and <strong>strong</strong>{' '}
            inheriting tokenised colours.
          </p>
        </Stack>
      </Section>

      <Section
        id="pills"
        title="Pill"
        description="Small rounded chip used for expertises, tags and taxonomy."
      >
        <Row>
          <Pill>Backend</Pill>
          <Pill>Frontend</Pill>
          <Pill>DevOps</Pill>
          <Pill>Data</Pill>
          <Pill>Security</Pill>
        </Row>
      </Section>

      <Section
        id="maturity"
        title="Maturity badges"
        description="Communicates the lifecycle state of an article."
      >
        <Row>
          <MaturityBadge maturity="recommended" />
          <MaturityBadge maturity="established" />
          <MaturityBadge maturity="exploratory" />
          <MaturityBadge maturity="deprecated" />
        </Row>
      </Section>

      <Section
        id="avatars"
        title="Avatars"
        description="Initials-based avatar with deterministic colour from the name."
      >
        <Row>
          <Avatar name="Anna Berg" />
          <Avatar name="Jonas Lie" />
          <Avatar name="Kari Nordmann" />
          <Avatar name="Ola Hansen" />
          <Avatar name="Eva Solberg" size={48} />
          <Avatar name="Custom" color="lilla" size={48} />
        </Row>
      </Section>

      <Section
        id="icons"
        title="Icons"
        description="Stroke-based 24×24 icon set (Lucide-compatible names)."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
            gap: 12,
          }}
        >
          {SHOWCASE_ICONS.map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: 10,
                border: '1px solid var(--hb-border)',
                borderRadius: 6,
                background: 'var(--hb-bg-soft)',
                fontSize: 11,
                color: 'var(--hb-fg-3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Icon name={name} size={22} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="empty"
        title="Empty state"
        description="Friendly zero-result block. Customisable icon, title, body and optional action."
      >
        <EmptyState
          icon="bookOpen"
          title="Ingen oppslag i ordlisten ennå."
          body="Når noen legger til termer i Sanity vil de dukke opp her."
          action={
            <Link href="/" style={{ color: 'var(--hb-accent)', fontSize: 13 }}>
              Tilbake til forsiden →
            </Link>
          }
        />
      </Section>

      <Section
        id="banners"
        title="Article banners"
        description="Maturity-based callouts shown at the top of an article body."
      >
        <Stack>
          <ArticleBanner kind="exploratory" />
          <ArticleBanner kind="deprecated" />
          <ArticleBanner
            kind="deprecated"
            supersededBy={{ title: 'Bruk Next.js App Router', href: '#' }}
          />
        </Stack>
      </Section>

      <Section
        id="livingdoc"
        title="Living-doc banner"
        description="Used on guides marked as living documents. Invites contribution."
      >
        <LivingDocBanner />
      </Section>
    </article>
  )
}
