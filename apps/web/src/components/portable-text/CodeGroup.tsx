import React from 'react'
import { codeToHtml } from 'shiki'
import type { DecorationItem } from 'shiki'
import { CodeGroupTabs } from './CodeGroupTabs'

const LIGHT_THEME = 'github-light'
const DARK_THEME = 'github-dark'

const LANG_ALIAS: Record<string, string> = {
  sh: 'bash', shell: 'bash', zsh: 'bash',
  plaintext: 'text', plain: 'text', text: 'text',
}

function normaliseLang(lang: string | null | undefined): string {
  if (!lang) return 'text'
  return LANG_ALIAS[lang.toLowerCase()] ?? lang.toLowerCase()
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderSnippet(snippet: any): Promise<{ label: string; html: { light: string; dark: string } }> {
  const code: string = snippet?.code?.code ?? snippet?.code ?? ''
  const language = normaliseLang(snippet?.code?.language ?? snippet?.language)
  const filename: string | null = snippet?.code?.filename ?? null
  const label = filename ?? language
  const showLineNumbers: boolean = snippet?.showLineNumbers ?? true
  const highlightLines = parseHighlightLines(snippet?.highlightLines)

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

  const transformers = showLineNumbers
    ? [{ line(node: { properties: Record<string, unknown> }, line: number) { node.properties['data-line'] = line } }]
    : undefined

  const opts = {
    lang: language,
    decorations: decorations.length ? decorations : undefined,
    transformers,
  }

  let light = ''
  let dark = ''
  try {
    ;[light, dark] = await Promise.all([
      codeToHtml(code || ' ', { ...opts, theme: LIGHT_THEME }),
      codeToHtml(code || ' ', { ...opts, theme: DARK_THEME }),
    ])
  } catch {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    light = dark = `<pre style="margin:0;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6"><code>${escaped}</code></pre>`
  }

  return { label, html: { light, dark } }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function CodeGroup({ value }: { value: any }): Promise<React.JSX.Element> {
  const snippets: unknown[] = value?.snippets ?? []

  if (snippets.length === 0) return <></>

  const tabs = await Promise.all(snippets.map(renderSnippet))

  return <CodeGroupTabs tabs={tabs} />
}
