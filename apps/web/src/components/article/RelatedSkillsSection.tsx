import type { Maturity } from '../../lib/queries'

interface RelatedSkill {
  _id: string
  title: string
  slug: string
  skillType: string
  summary: string | null
  maturity: Maturity
}

const SKILL_TYPE_LABELS: Record<string, string> = {
  prompt: 'Prompt',
  workflow: 'Workflow',
  evaluation: 'Evaluering',
}

export function RelatedSkillsSection({ skills }: { skills: RelatedSkill[] }): React.JSX.Element | null {
  if (!skills || skills.length === 0) return null

  return (
    <aside
      style={{
        marginTop: 48,
        padding: '20px 24px',
        background: 'color-mix(in srgb, var(--color-indigo, #6366f1) 6%, var(--color-bg))',
        border: '1px solid color-mix(in srgb, var(--color-indigo, #6366f1) 20%, transparent)',
        borderRadius: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span
          aria-hidden="true"
          style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}
        >
          ⚡
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'color-mix(in srgb, var(--color-indigo, #6366f1) 80%, var(--color-text))',
          }}
        >
          Relaterte skills
        </h2>
      </div>

      {/* Horizontal scroll container */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollSnapType: 'x mandatory',
          /* hide scrollbar visually but keep it functional */
          msOverflowStyle: 'none',
        }}
      >
        {skills.map((skill) => (
          <a
            key={skill._id}
            href={`/ai-skills/${skill.slug}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flex: '0 0 220px',
              scrollSnapAlign: 'start',
              padding: '14px 16px',
              borderRadius: 8,
              border: '1px solid color-mix(in srgb, var(--color-indigo, #6366f1) 25%, transparent)',
              background: 'var(--color-bg)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.1s, box-shadow 0.1s',
            }}
          >
            {/* Type badge */}
            <span
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                padding: '2px 7px',
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'color-mix(in srgb, var(--color-indigo, #6366f1) 12%, transparent)',
                color: 'color-mix(in srgb, var(--color-indigo, #6366f1) 85%, var(--color-text))',
                border: '1px solid color-mix(in srgb, var(--color-indigo, #6366f1) 20%, transparent)',
              }}
            >
              {SKILL_TYPE_LABELS[skill.skillType] ?? skill.skillType}
            </span>

            {/* Title */}
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-text)',
                lineHeight: 1.35,
              }}
            >
              {skill.title}
            </span>

            {/* Summary */}
            {skill.summary && (
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {skill.summary}
              </span>
            )}

            {/* Footer: "Bruk skill →" CTA */}
            <span
              style={{
                marginTop: 'auto',
                paddingTop: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'color-mix(in srgb, var(--color-indigo, #6366f1) 85%, var(--color-text))',
              }}
            >
              Bruk skill →
            </span>
          </a>
        ))}
      </div>
    </aside>
  )
}
