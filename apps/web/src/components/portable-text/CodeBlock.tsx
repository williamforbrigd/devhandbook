import React from 'react'
import { codeToHtml } from 'shiki'
import type { DecorationItem } from 'shiki'
import { CopyButton } from './CopyButton'

// ── Highlight line parser ─────────────────────────────────────────────────────

/** Parse "1,3-5,8" → Set of 1-based line numbers */
function parseHighlightLines(raw: string | null | undefined): Set<number> {
  const set = new Set<number>()
  if (!raw) return set
  for (const part of raw.split(',')) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-').map(Number)
      const a = parts[0] ?? 0
      const b = parts[1] ?? a
      for (let i = a; i <= b; i++) set.add(i)
    } else if (trimmed) {
      set.add(Number(trimmed))
    }
  }
  return set
}

// ── Language normaliser ───────────────────────────────────────────────────────

/** Map Sanity @sanity/code-input language values to Shiki bundle keys */
const LANG_ALIAS: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  plaintext: 'text',
  plain: 'text',
  text: 'text',
}

function normaliseLang(lang: string | null | undefined): string {
  if (!lang) return 'text'
  return LANG_ALIAS[lang.toLowerCase()] ?? lang.toLowerCase()
}

// ── Theme map (light / dark) ──────────────────────────────────────────────────

import { handbookLight, handbookDark } from '../../lib/shikiThemes'

const LIGHT_THEME = handbookLight
const DARK_THEME = handbookDark

// ── Server component ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function CodeBlock({ value }: { value: any }): Promise<React.JSX.Element> {
  const code: string = value?.code?.code ?? value?.code ?? ''
  const language = normaliseLang(value?.code?.language ?? value?.language)
  const filename: string | null = value?.code?.filename ?? null
  const highlightLines = parseHighlightLines(value?.highlightLines)
  const showLineNumbers: boolean = value?.showLineNumbers ?? true

  // Build decorations for highlighted lines
  const lines = code.split('\n')
  const decorations: DecorationItem[] = Array.from(highlightLines).flatMap((lineNum) => {
    const lineIndex = lineNum - 1
    if (lineIndex < 0 || lineIndex >= lines.length) return []
    const lineLen = lines[lineIndex]?.length ?? 0
    return [{
      start: { line: lineIndex, character: 0 },
      end: { line: lineIndex, character: lineLen },
      properties: { class: 'highlighted-line' },
    }]
  })

  let lightHtml = ''
  let darkHtml = ''
  try {
    ;[lightHtml, darkHtml] = await Promise.all([
      codeToHtml(code || ' ', {
        lang: language as string,
        theme: LIGHT_THEME,
        decorations: decorations.length ? decorations : undefined,
        transformers: showLineNumbers
          ? [
              {
                line(node, line) {
                  node.properties['data-line'] = line
                },
              },
            ]
          : undefined,
      }),
      codeToHtml(code || ' ', {
        lang: language as string,
        theme: DARK_THEME,
        decorations: decorations.length ? decorations : undefined,
        transformers: showLineNumbers
          ? [
              {
                line(node, line) {
                  node.properties['data-line'] = line
                },
              },
            ]
          : undefined,
      }),
    ])
  } catch {
    // Fallback: unsupported language — render plain
    lightHtml = darkHtml = `<pre style="margin:0;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  }

  return (
    <div
      style={{
        margin: '1.25rem 0',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        fontSize: 13,
      }}
    >
      {/* Header row: filename + copy button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 12px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          minHeight: 32,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            color: 'var(--color-text-muted)',
          }}
        >
          {filename ?? language}
        </span>
        <CopyButton code={code} />
      </div>

      {/* Shiki-rendered code — light theme shown by default, dark theme when .dark class is on <html> */}
      <div
        className="shiki-wrapper"
        style={{ position: 'relative', overflowX: 'auto' }}
        data-show-line-numbers={showLineNumbers ? '' : undefined}
      >
        {/* Light */}
        <div
          className="shiki-light"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: lightHtml }}
        />
        {/* Dark */}
        <div
          className="shiki-dark"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: darkHtml }}
        />
      </div>
    </div>
  )
}
