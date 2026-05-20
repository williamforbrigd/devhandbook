/**
 * Server-side body preprocessor.
 *
 * Runs Shiki syntax highlighting for `hb.codeBlock` and `hb.codeGroup` blocks
 * before the body is passed to ArticleBody (a client component). The rendered
 * HTML is embedded as `__lightHtml`/`__darkHtml` (single blocks) or `__tabs`
 * (code groups) so the client-side components can render without being async.
 */
import { codeToHtml } from 'shiki'
import type { DecorationItem } from 'shiki'
import { handbookLight, handbookDark } from './shikiThemes'

// ── Shared helpers (duplicated from CodeBlock to keep server/client split) ────

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
      const [a = 0, b = 0] = trimmed.split('-').map(Number)
      for (let i = a; i <= b; i++) set.add(i)
    } else if (trimmed) {
      set.add(Number(trimmed))
    }
  }
  return set
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderCode(block: any): Promise<{ light: string; dark: string }> {
  const code: string = block?.code?.code ?? block?.code ?? ''
  const language = normaliseLang(block?.code?.language ?? block?.language)
  const showLineNumbers: boolean = block?.showLineNumbers ?? true
  const highlightLines = parseHighlightLines(block?.highlightLines)

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

  try {
    const [light, dark] = await Promise.all([
      codeToHtml(code || ' ', { ...opts, theme: handbookLight }),
      codeToHtml(code || ' ', { ...opts, theme: handbookDark }),
    ])
    return { light, dark }
  } catch {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const fallback = `<pre style="margin:0;padding:16px;overflow-x:auto;font-size:13px;line-height:1.6"><code>${escaped}</code></pre>`
    return { light: fallback, dark: fallback }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function preprocessBody(body: any[]): Promise<any[]> {
  if (!Array.isArray(body)) return []
  return Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body.map(async (block: any) => {
      if (block._type === 'hb.codeBlock') {
        const { light, dark } = await renderCode(block)
        return {
          ...block,
          __code:           block?.code?.code ?? block?.code ?? '',
          __language:       normaliseLang(block?.code?.language ?? block?.language),
          __filename:       block?.code?.filename ?? null,
          __showLineNumbers: block?.showLineNumbers ?? true,
          __lightHtml:      light,
          __darkHtml:       dark,
        }
      }

      if (block._type === 'hb.codeGroup') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const snippets: any[] = block?.snippets ?? []
        const tabs = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          snippets.map(async (snippet: any) => {
            const { light, dark } = await renderCode(snippet)
            const filename: string | null = snippet?.code?.filename ?? null
            const language = normaliseLang(snippet?.code?.language ?? snippet?.language)
            const code: string = snippet?.code?.code ?? snippet?.code ?? ''
            return {
              label: filename ?? language,
              filename,
              code,
              html: { light, dark },
            }
          }),
        )
        return { ...block, __tabs: tabs }
      }

      return block
    }),
  )
}
