import Link from 'next/link'
import { CopyButton } from './CopyButton'

// ── Icons (inline SVG, no extra dep) ─────────────────────────────────────────

function WandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  )
}

function GitBranchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}

function CheckSquareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

// ── Maturity badge ────────────────────────────────────────────────────────────

const MATURITY_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  established:  { bg: '#dcfce7', color: '#15803d', label: 'Established' },
  recommended:  { bg: '#dbeafe', color: '#1d4ed8', label: 'Recommended' },
  exploratory:  { bg: '#fef9c3', color: '#854d0e', label: 'Exploratory' },
  deprecated:   { bg: '#fee2e2', color: '#b91c1c', label: 'Deprecated' },
}

function MaturityBadge({ maturity }: { maturity?: string }) {
  const s = MATURITY_STYLE[maturity ?? ''] ?? { bg: 'var(--color-surface)', color: 'var(--color-text-muted)', label: maturity ?? '' }
  return (
    <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ── Artifact field row (full mode) ────────────────────────────────────────────

function ArtifactField({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <CopyButton code={text} />
      </div>
      <pre style={{
        margin: 0,
        padding: '10px 14px',
        background: 'var(--color-bg-subtle, #f6f8fa)',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        fontSize: 12,
        lineHeight: 1.6,
        fontFamily: 'ui-monospace, monospace',
        whiteSpace: 'pre-wrap',
        overflowX: 'auto',
        maxHeight: 320,
        overflowY: 'auto',
      }}>
        {text}
      </pre>
    </div>
  )
}

// ── Skill type icon ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillIcon({ skillType }: { skillType: any }) {
  if (skillType === 'workflow')   return <GitBranchIcon />
  if (skillType === 'evaluation') return <CheckSquareIcon />
  return <WandIcon /> // default: prompt
}

// ── Shared header ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillHeader({ skill, accentColor }: { skill: any; accentColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      {/* Icon pill */}
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
        color: accentColor,
      }}>
        <SkillIcon skillType={skill.skillType} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link
            href={`/ai-skills/${skill.slug}`}
            style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)', textDecoration: 'none' }}
          >
            {skill.title}
          </Link>
          <MaturityBadge maturity={skill.maturity} />
        </div>
        {skill.summary && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            {skill.summary}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Accent colour per skill type ──────────────────────────────────────────────

const ACCENT: Record<string, string> = {
  prompt:     '#7c3aed',
  workflow:   '#0369a1',
  evaluation: '#15803d',
}
function accentFor(skillType: string): string {
  return ACCENT[skillType] ?? '#64748b'
}

// ── Card mode ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillCard({ skill }: { skill: any }) {
  const accent = accentFor(skill.skillType)
  const systemPrompt: string = skill.promptArtifact?.systemPrompt ?? ''

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      padding: '14px 16px',
      background: 'var(--color-surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <SkillHeader skill={skill} accentColor={accent} />

      {systemPrompt && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CopyButton code={systemPrompt} />
        </div>
      )}
    </div>
  )
}

// ── Full mode ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SkillFull({ skill }: { skill: any }) {
  const accent = accentFor(skill.skillType)
  const pa = skill.promptArtifact
  const wa = skill.workflowArtifact
  const ea = skill.evaluationArtifact

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 10,
      overflow: 'hidden',
      background: 'var(--color-surface)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <SkillHeader skill={skill} accentColor={accent} />
      </div>

      {/* Prompt artifact */}
      {pa && (
        <div style={{ padding: '16px 20px', borderBottom: wa ?? ea ? '1px solid var(--color-border)' : undefined }}>
          {pa.systemPrompt && <ArtifactField label="System prompt" text={pa.systemPrompt} />}
          {pa.userPromptTemplate && <ArtifactField label="User prompt template" text={pa.userPromptTemplate} />}

          {/* Variables */}
          {Array.isArray(pa.variables) && pa.variables.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Variables
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Name', 'Description', 'Example'].map((h) => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', background: 'var(--color-bg-subtle, #f6f8fa)', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {pa.variables.map((v: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '6px 10px', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{v.name}</td>
                      <td style={{ padding: '6px 10px', color: 'var(--color-text-muted)' }}>{v.description}</td>
                      <td style={{ padding: '6px 10px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{v.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Workflow artifact */}
      {wa?.steps && wa.steps.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: ea ? '1px solid var(--color-border)' : undefined }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Workflow steps
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {wa.steps.map((step: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: accent, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {step.title && <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{step.title}</div>}
                {step.prompt && <ArtifactField label="Prompt" text={step.prompt} />}
                {step.expectedOutput && <ArtifactField label="Expected output" text={step.expectedOutput} />}
                {step.notes && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>{step.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evaluation artifact */}
      {ea?.criteria && ea.criteria.length > 0 && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Evaluation criteria
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {ea.criteria.map((c: any, i: number) => (
            <div key={i} style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg-subtle, #f6f8fa)' }}>
              {c.label && <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.label}</div>}
              {c.description && <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--color-text-muted)' }}>{c.description}</p>}
              {c.scoringGuide && <ArtifactField label="Scoring guide" text={c.scoringGuide} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SkillEmbed({ value }: { value: any }): React.JSX.Element | null {
  const skill = value?.skill
  if (!skill) return null

  const displayMode: string = value?.displayMode ?? 'card'

  return (
    <div style={{ margin: '1.5rem 0' }}>
      {displayMode === 'full' ? <SkillFull skill={skill} /> : <SkillCard skill={skill} />}
    </div>
  )
}
