import Link from 'next/link'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SkillRef({ value, children }: { value: any; children?: any }): React.JSX.Element {
  const skill = value?.skill
  const slug: string | undefined = skill?.slug

  // Fallback: unresolved reference — render children as plain text
  if (!slug) {
    return <span style={{ opacity: 0.5 }}>{children}</span>
  }

  return (
    <Link
      href={`/ai-skills/${slug}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '1px 8px',
        borderRadius: 999,
        fontSize: '0.85em',
        fontWeight: 600,
        lineHeight: 1.6,
        background: 'color-mix(in srgb, #7c3aed 10%, transparent)',
        color: '#7c3aed',
        border: '1px solid color-mix(in srgb, #7c3aed 25%, transparent)',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      ⚡ {skill.title ?? children} →
    </Link>
  )
}
