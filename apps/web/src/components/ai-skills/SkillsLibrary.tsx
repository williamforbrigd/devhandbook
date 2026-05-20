'use client'

import { useMemo, useState } from 'react'
import type { AiSkillListItem, AiCollectionItem, Expertise, Maturity } from '../../lib/queries'

// ── Icons ─────────────────────────────────────────────────────────────────────

const SKILL_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  prompt:     { label: 'Prompt',     icon: '⚡', color: '#7c3aed' },
  workflow:   { label: 'Workflow',   icon: '⚙️', color: '#0284c7' },
  evaluation: { label: 'Evaluering', icon: '📊', color: '#059669' },
}

const MATURITY_ORDER: Record<Maturity, number> = {
  recommended: 0,
  established: 1,
  exploratory: 2,
  deprecated: 3,
}

const TARGET_MODEL_OPTIONS = ['Claude', 'GPT-4o', 'Gemini', 'Model-agnostic']

type SortKey = 'updated' | 'maturity' | 'alpha'

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  skills: AiSkillListItem[]
  collections: AiCollectionItem[]
  expertises: Expertise[]
}

// ── Filter chip ───────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  color,
  onClick,
}: {
  label: string
  active: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 12px',
        borderRadius: 99,
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        border: `1px solid ${active ? (color ?? 'var(--color-indigo, #6366f1)') : 'var(--color-border)'}`,
        background: active
          ? `color-mix(in srgb, ${color ?? 'var(--color-indigo, #6366f1)'} 12%, var(--color-bg))`
          : 'var(--color-surface)',
        color: active ? (color ?? 'var(--color-indigo, #6366f1)') : 'var(--color-text-muted)',
        cursor: 'pointer',
        transition: 'all 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ── Collection card ───────────────────────────────────────────────────────────

function CollectionCard({ collection }: { collection: AiCollectionItem }) {
  return (
    <a
      href={`/ai-skills/collections/${collection.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '18px 20px',
        borderRadius: 10,
        border: '1px solid var(--color-border)',
        background: 'color-mix(in srgb, var(--color-indigo, #6366f1) 4%, var(--color-bg))',
        textDecoration: 'none',
        color: 'inherit',
        flex: '1 1 280px',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', flex: 1, lineHeight: 1.3 }}>
          {collection.title}
        </span>
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 99,
            background: 'color-mix(in srgb, var(--color-indigo, #6366f1) 12%, transparent)',
            color: 'var(--color-indigo, #6366f1)',
          }}
        >
          {collection.skills.length} skills
        </span>
      </div>
      {collection.description && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {collection.description}
        </p>
      )}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {collection.skills.slice(0, 3).map((s) => {
          const meta = SKILL_TYPE_META[s.skillType] ?? SKILL_TYPE_META.prompt!
          return (
            <li
              key={s._id}
              style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span style={{ fontSize: 11 }}>{meta.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
            </li>
          )
        })}
        {collection.skills.length > 3 && (
          <li style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            +{collection.skills.length - 3} til…
          </li>
        )}
      </ul>
    </a>
  )
}

// ── Skill card ────────────────────────────────────────────────────────────────

function SkillCard({ skill }: { skill: AiSkillListItem }) {
  const meta = SKILL_TYPE_META[skill.skillType] ?? SKILL_TYPE_META.prompt!
  const targetModels = skill.targetModel ?? []
  return (
    <a
      href={`/ai-skills/${skill.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '16px 18px',
        borderRadius: 9,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.12s, box-shadow 0.12s',
        minWidth: 0,
      }}
    >
      {/* Header: icon + type badge + maturity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 7,
            background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {meta.icon}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: meta.color,
            padding: '2px 6px',
            borderRadius: 99,
            background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${meta.color} 20%, transparent)`,
          }}
        >
          {meta.label}
        </span>
        <span style={{ flex: 1 }} />
        <MaturityPill maturity={skill.maturity} />
      </div>

      {/* Title */}
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.35 }}>
        {skill.title}
      </span>

      {/* Summary */}
      {(skill.summary ?? skill.useCase) && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {skill.summary ?? skill.useCase}
        </span>
      )}

      {/* Footer: targetModel badges + last tested */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 4 }}>
        {targetModels.slice(0, 3).map((m) => (
          <span
            key={m}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {m}
          </span>
        ))}
        {skill.lastVerifiedAt && (
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            Testet{' '}
            {new Date(skill.lastVerifiedAt).toLocaleDateString('no-NO', { year: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </a>
  )
}

// ── Maturity pill ─────────────────────────────────────────────────────────────

const MATURITY_STYLE: Record<Maturity, { bg: string; color: string; label: string }> = {
  recommended: { bg: '#d1fae5', color: '#065f46', label: 'Anbefalt' },
  established: { bg: '#dbeafe', color: '#1e40af', label: 'Etablert' },
  exploratory: { bg: '#fef3c7', color: '#92400e', label: 'Utforskende' },
  deprecated:  { bg: '#fee2e2', color: '#991b1b', label: 'Utgått' },
}

function MaturityPill({ maturity }: { maturity: Maturity }) {
  const s = MATURITY_STYLE[maturity] ?? MATURITY_STYLE.established
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 99,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {s.label}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SkillsLibrary({ skills, collections, expertises }: Props): React.JSX.Element {
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterExpertise, setFilterExpertise] = useState<string | null>(null)
  const [filterModel, setFilterModel] = useState<string | null>(null)
  const [filterMaturity, setFilterMaturity] = useState<Maturity | null>(null)
  const [sort, setSort] = useState<SortKey>('updated')

  const hasFilters = filterType || filterExpertise || filterModel || filterMaturity

  const filtered = useMemo(() => {
    let result = skills.filter((s) => {
      const skillExpertises = s.expertises ?? []
      const targetModels = s.targetModel ?? []
      if (filterType && s.skillType !== filterType) return false
      if (filterExpertise && !skillExpertises.some((e) => e.slug === filterExpertise)) return false
      if (filterModel && !targetModels.includes(filterModel)) return false
      if (filterMaturity && s.maturity !== filterMaturity) return false
      return true
    })
    if (sort === 'updated') {
      result = [...result].sort((a, b) => b._updatedAt.localeCompare(a._updatedAt))
    } else if (sort === 'maturity') {
      result = [...result].sort((a, b) => MATURITY_ORDER[a.maturity] - MATURITY_ORDER[b.maturity])
    } else {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'no'))
    }
    return result
  }, [skills, filterType, filterExpertise, filterModel, filterMaturity, sort])

  return (
    <div>
      {/* ── Collections ──────────────────────────────────────────────────── */}
      {collections.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              margin: '0 0 14px',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-text-muted)',
            }}
          >
            Samlinger
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {collections.map((c) => (
              <CollectionCard key={c._id} collection={c} />
            ))}
          </div>
        </section>
      )}

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '16px 20px',
          borderRadius: 10,
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          marginBottom: 24,
        }}
      >
        {/* Skill type */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4, whiteSpace: 'nowrap' }}>
            Type
          </span>
          {Object.entries(SKILL_TYPE_META).map(([key, meta]) => (
            <FilterChip
              key={key}
              label={`${meta.icon} ${meta.label}`}
              active={filterType === key}
              color={meta.color}
              onClick={() => setFilterType(filterType === key ? null : key)}
            />
          ))}
        </div>

        {/* Target model */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4, whiteSpace: 'nowrap' }}>
            Modell
          </span>
          {TARGET_MODEL_OPTIONS.map((m) => (
            <FilterChip
              key={m}
              label={m}
              active={filterModel === m}
              onClick={() => setFilterModel(filterModel === m ? null : m)}
            />
          ))}
        </div>

        {/* Expertise */}
        {expertises.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4, whiteSpace: 'nowrap' }}>
              Fagområde
            </span>
            {expertises.map((e) => (
              <FilterChip
                key={e._id}
                label={e.title}
                active={filterExpertise === e.slug}
                onClick={() => setFilterExpertise(filterExpertise === e.slug ? null : e.slug)}
              />
            ))}
          </div>
        )}

        {/* Maturity */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4, whiteSpace: 'nowrap' }}>
            Modenhet
          </span>
          {(['recommended', 'established', 'exploratory'] as Maturity[]).map((m) => (
            <FilterChip
              key={m}
              label={MATURITY_STYLE[m].label}
              active={filterMaturity === m}
              onClick={() => setFilterMaturity(filterMaturity === m ? null : m)}
            />
          ))}
        </div>

        {/* Sort + clear row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingTop: 6,
            borderTop: '1px solid var(--color-border)',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 4, whiteSpace: 'nowrap' }}>
            Sorter
          </span>
          {([['updated', 'Nylig oppdatert'], ['maturity', 'Modenhet'], ['alpha', 'Alfabetisk']] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: sort === key ? 700 : 500,
                border: sort === key ? '1px solid var(--color-text-muted)' : '1px solid var(--color-border)',
                background: sort === key ? 'var(--color-text-muted)' : 'transparent',
                color: sort === key ? 'var(--color-bg)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {label}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={() => {
                setFilterType(null)
                setFilterExpertise(null)
                setFilterModel(null)
                setFilterMaturity(null)
              }}
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                textDecoration: 'underline',
              }}
            >
              Nullstill filter
            </button>
          )}
        </div>
      </div>

      {/* ── Results count ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {filtered.length === skills.length
            ? `${skills.length} skills`
            : `${filtered.length} av ${skills.length} skills`}
        </span>
        {/* Active filter pills */}
        {hasFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {filterType && (
              <ActiveFilterPill label={SKILL_TYPE_META[filterType]?.label ?? filterType} onRemove={() => setFilterType(null)} />
            )}
            {filterModel && (
              <ActiveFilterPill label={filterModel} onRemove={() => setFilterModel(null)} />
            )}
            {filterExpertise && (
              <ActiveFilterPill
                label={expertises.find((e) => e.slug === filterExpertise)?.title ?? filterExpertise}
                onRemove={() => setFilterExpertise(null)}
              />
            )}
            {filterMaturity && (
              <ActiveFilterPill label={MATURITY_STYLE[filterMaturity].label} onRemove={() => setFilterMaturity(null)} />
            )}
          </div>
        )}
      </div>

      {/* ── Skill grid ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, padding: '32px 0' }}>
          Ingen skills matcher filteret.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14,
          }}
        >
          {filtered.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Active filter pill ────────────────────────────────────────────────────────

function ActiveFilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontSize: 13,
          lineHeight: 1,
          color: 'inherit',
        }}
        aria-label={`Fjern filter: ${label}`}
      >
        ×
      </button>
    </span>
  )
}
