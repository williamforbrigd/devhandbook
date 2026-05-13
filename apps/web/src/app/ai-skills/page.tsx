import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchAiSkills } from '../../lib/queries'
import { MaturityBadge } from '../../components/article/MaturityBadge'

export const metadata: Metadata = { title: 'AI Skills' }

const SKILL_TYPE_LABEL: Record<string, string> = {
  prompt: 'Prompt',
  workflow: 'Workflow',
  evaluation: 'Evaluation',
}

export default async function AiSkillsPage(): Promise<React.JSX.Element> {
  const skills = await fetchAiSkills()

  const byType = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const t = s.skillType ?? 'prompt'
    if (!acc[t]) acc[t] = []
    acc[t]!.push(s)
    return acc
  }, {})

  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
        AI Skills
      </h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 15 }}>
        Reusable prompts and workflows for working with AI.
      </p>

      {skills.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No skills yet.</p>}

      {(['prompt', 'workflow', 'evaluation'] as const).map((type) => {
        const group = byType[type]
        if (!group?.length) return null
        return (
          <section key={type} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
              {SKILL_TYPE_LABEL[type]}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.map((skill) => (
                <Link
                  key={skill._id}
                  href={`/ai-skills/${skill.slug}`}
                  style={{
                    display: 'block',
                    padding: '16px 20px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    textDecoration: 'none',
                    background: 'var(--color-bg)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: skill.useCase ? 6 : 0 }}>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                      {skill.title}
                    </span>
                    <MaturityBadge maturity={skill.maturity} />
                    {skill.targetModel.length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', background: 'var(--color-surface)', padding: '2px 6px', borderRadius: 4 }}>
                        {skill.targetModel.join(', ')}
                      </span>
                    )}
                  </div>
                  {skill.useCase && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      {skill.useCase}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
