import Link from 'next/link'

// ── URL parser ────────────────────────────────────────────────────────────────

type EmbedKind =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'codesandbox'; embedUrl: string }
  | { kind: 'stackblitz'; embedUrl: string }
  | { kind: 'unknown' }

function parseUrl(raw: string): EmbedKind {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return { kind: 'unknown' }
  }

  const host = u.hostname.replace(/^www\./, '')

  // ── YouTube ──────────────────────────────────────────────────────────────
  if (host === 'youtube.com' || host === 'youtu.be') {
    let videoId: string | null = null
    if (host === 'youtu.be') {
      videoId = u.pathname.slice(1).split('/')[0] ?? null
    } else if (u.pathname === '/watch') {
      videoId = u.searchParams.get('v')
    } else if (u.pathname.startsWith('/embed/')) {
      videoId = u.pathname.slice('/embed/'.length).split('/')[0] ?? null
    }
    if (videoId) {
      return {
        kind: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      }
    }
  }

  // ── CodeSandbox ──────────────────────────────────────────────────────────
  if (host === 'codesandbox.io') {
    const match = u.pathname.match(/^\/(?:s|p\/sandbox)\/([^/?#]+)/)
    if (match) {
      return {
        kind: 'codesandbox',
        embedUrl: `https://codesandbox.io/embed/${match[1]}?fontsize=14&hidenavigation=1&theme=dark&view=split`,
      }
    }
  }

  // ── StackBlitz ───────────────────────────────────────────────────────────
  if (host === 'stackblitz.com') {
    if (u.pathname.startsWith('/edit/') || u.pathname.startsWith('/github/')) {
      const sep = raw.includes('?') ? '&' : '?'
      return {
        kind: 'stackblitz',
        embedUrl: `${raw}${sep}embed=1&ctl=1`,
      }
    }
  }

  return { kind: 'unknown' }
}

// ── Label helpers ─────────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  codesandbox: 'CodeSandbox',
  stackblitz: 'StackBlitz',
}

function providerLabel(kind: string): string {
  return PROVIDER_LABELS[kind] ?? kind
}

// ── Sub-components ────────────────────────────────────────────────────────────

function IframeEmbed({
  embedUrl,
  title,
  aspect,
  height,
}: {
  embedUrl: string
  title: string
  aspect?: '16/9'
  height?: number
}) {
  const wrapperStyle: React.CSSProperties =
    aspect === '16/9'
      ? { position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }
      : { height: height ?? 500, position: 'relative' }

  const iframeStyle: React.CSSProperties =
    aspect === '16/9'
      ? { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }
      : { width: '100%', height: '100%', border: 0 }

  return (
    <div style={wrapperStyle}>
      <iframe
        src={embedUrl}
        title={title}
        style={iframeStyle}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      />
    </div>
  )
}

function LinkCard({ url, title }: { url: string; title?: string }) {
  let hostname = url
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    /* keep raw */
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        textDecoration: 'none',
        color: 'var(--color-text)',
        fontSize: 14,
      }}
    >
      {/* External-link icon (inline SVG, no dep) */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, color: 'var(--color-text-muted)' }}
        aria-hidden
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
      <span style={{ overflow: 'hidden' }}>
        {title && (
          <span style={{ display: 'block', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
        )}
        <span style={{ display: 'block', fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {hostname}
        </span>
      </span>
    </a>
  )
}

// ── Public component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Embed({ value }: { value: any }): React.JSX.Element | null {
  const url: string = value?.url
  const title: string | undefined = value?.title

  if (!url) return null

  const parsed = parseUrl(url)

  const iframeTitle = title ?? providerLabel(parsed.kind)

  return (
    <figure style={{ margin: '1.5rem 0' }}>
      {parsed.kind === 'youtube' && (
        <IframeEmbed embedUrl={parsed.embedUrl} title={iframeTitle} aspect="16/9" />
      )}
      {(parsed.kind === 'codesandbox' || parsed.kind === 'stackblitz') && (
        <IframeEmbed embedUrl={parsed.embedUrl} title={iframeTitle} height={480} />
      )}
      {parsed.kind === 'unknown' && (
        <LinkCard url={url} title={title} />
      )}

      {title && parsed.kind !== 'unknown' && (
        <figcaption style={{ marginTop: 6, fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {title}
        </figcaption>
      )}
    </figure>
  )
}
