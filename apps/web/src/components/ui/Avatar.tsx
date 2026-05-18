import React from 'react'

const COLORS = ['blue', 'ink', 'lilla'] as const
type AvatarColor = (typeof COLORS)[number]

/** Hash a name to a deterministic colour. */
function colorFor(name: string): AvatarColor {
  let h = 0
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) | 0
  }
  const idx = Math.abs(h) % COLORS.length
  return COLORS[idx] ?? 'blue'
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

export function Avatar({
  name,
  avatarUrl,
  size,
  color,
  title,
}: {
  name: string
  avatarUrl?: string | null
  size?: number
  color?: AvatarColor
  title?: string
}): React.JSX.Element {
  const cls = `hb-avatar hb-avatar--${color ?? colorFor(name)}`
  const style: React.CSSProperties | undefined = size
    ? { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.4)) }
    : undefined
  return (
    <span className={cls} style={style} title={title ?? name} aria-label={name}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        initialsFor(name)
      )}
    </span>
  )
}

/** Wrap a list of <Avatar /> children to get overlapping stack styling. */
export function Avatars({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}): React.JSX.Element {
  return (
    <div className="hb-avatars" title={title}>
      {children}
    </div>
  )
}
