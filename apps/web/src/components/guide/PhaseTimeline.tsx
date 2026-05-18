import React from 'react'

export type PhaseTimelineItem = {
  id?: string
  label: string
  duration?: string | null
}

/**
 * Horizontal stepped timeline of phases (Discover → Define → Develop → Deliver).
 * Each step is an anchor link to `#${id ?? label-slug}`.
 * Steps before `activeIndex` are marked "done", the active one is highlighted.
 */
export function PhaseTimeline({
  phases,
  activeIndex = 0,
}: {
  phases: PhaseTimelineItem[]
  activeIndex?: number
}): React.JSX.Element | null {
  if (phases.length === 0) return null
  return (
    <ol className="hb-phases" aria-label="Faser">
      {phases.map((p, i) => {
        const id = p.id ?? slugify(p.label)
        const state = i < activeIndex ? 'is-done' : i === activeIndex ? 'is-active' : ''
        return (
          <li key={id} className={`hb-phases__step ${state}`.trim()}>
            <a
              href={`#${id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'inherit',
                textDecoration: 'none',
                flex: 1,
                minWidth: 0,
              }}
            >
              <span className="hb-phases__num">{i + 1}</span>
              <span className="hb-phases__lbl">
                {p.label}
                {p.duration && (
                  <span style={{ marginLeft: 6, fontWeight: 400, opacity: 0.7 }}>
                    {p.duration}
                  </span>
                )}
              </span>
            </a>
            {i < phases.length - 1 && <span className="hb-phases__bar" />}
          </li>
        )
      })}
    </ol>
  )
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
