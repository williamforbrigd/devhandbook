/**
 * portableTextToMarkdown
 *
 * Converts a Sanity Portable Text block array (including all hb.* custom types)
 * to a Markdown string that is AI-friendly and renders well as GitHub-Flavored Markdown.
 *
 * Intentionally zero dependencies beyond the standard library.
 */

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function escapeMarkdown(text: string): string {
  // Only escape characters that would change meaning in inline context
  return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1')
}

// ── Span / inline rendering ────────────────────────────────────────────────────

function renderSpan(span: any, markDefs: any[]): string {
  const text: string = span.text ?? ''
  if (!span.marks?.length) return escapeMarkdown(text)

  // Build a set of active mark types + resolve refs
  let result = escapeMarkdown(text)
  const marks: string[] = span.marks ?? []

  for (const mark of marks) {
    // Inline formatting
    if (mark === 'strong') { result = `**${result}**`; continue }
    if (mark === 'em')     { result = `_${result}_`;   continue }
    if (mark === 'code')   { result = `\`${result}\``; continue }

    // Annotation — look up in markDefs
    const def = markDefs.find((d: any) => d._key === mark)
    if (!def) continue

    if (def._type === 'link' || def._type === 'externalLink') {
      result = `[${result}](${def.href ?? def.url ?? ''})`
    } else if (def._type === 'internalLink' && def.article) {
      const href = `/${def.article.section?.slug ?? ''}/${def.article.slug ?? ''}`
      result = `[${result}](${href})`
    } else if (def._type === 'glossaryRef' && def.term) {
      result = `[${result}](/glossary#${def.term.slug ?? ''})`
    } else if (def._type === 'skillRef' && def.skill) {
      result = `[${result}](/ai-skills/${def.skill.slug ?? ''})`
    }
  }

  return result
}

function renderChildren(children: any[], markDefs: any[]): string {
  return (children ?? []).map((child: any) => renderSpan(child, markDefs)).join('')
}

// ── Block-level rendering ──────────────────────────────────────────────────────

function renderTextBlock(block: any): string {
  const text = renderChildren(block.children ?? [], block.markDefs ?? [])
  const style: string = block.style ?? 'normal'

  if (style === 'h1') return `# ${text}`
  if (style === 'h2') return `## ${text}`
  if (style === 'h3') return `### ${text}`
  if (style === 'h4') return `#### ${text}`
  if (style === 'h5') return `##### ${text}`
  if (style === 'blockquote') return `> ${text}`
  return text // normal / default
}

// ── Custom type renderers ──────────────────────────────────────────────────────

function renderCodeBlock(block: any): string {
  const lang = block.language ?? ''
  const code = block.code ?? ''
  const filename = block.filename ? `<!-- ${block.filename} -->\n` : ''
  return `${filename}\`\`\`${lang}\n${code}\n\`\`\``
}

function renderCallout(block: any): string {
  const variant: string = block.variant ?? 'info'
  const prefix: Record<string, string> = {
    info:    '> **ℹ️ Info**',
    warning: '> **⚠️ Advarsel**',
    danger:  '> **🚨 Fare**',
    tip:     '> **💡 Tips**',
    success: '> **✅ Merk**',
  }
  const header = prefix[variant] ?? '> **ℹ️ Info**'
  const body = portableTextToMarkdown(block.body ?? [])
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n')
  return `${header}\n>\n${body}`
}

function renderDecisionRecord(block: any): string {
  const lines: string[] = []
  if (block.title) lines.push(`### ${block.title}`)
  if (block.status) lines.push(`**Status:** ${block.status}`)
  if (block.context) lines.push(`\n**Kontekst**\n\n${block.context}`)
  if (block.decision) lines.push(`\n**Beslutning**\n\n${block.decision}`)
  if (block.consequences) lines.push(`\n**Konsekvenser**\n\n${block.consequences}`)
  if ((block.alternatives ?? []).length > 0) {
    lines.push(`\n**Alternativer vurdert**`)
    for (const alt of block.alternatives) {
      lines.push(`- ${alt}`)
    }
  }
  return lines.join('\n')
}

function renderChecklist(block: any): string {
  const title = block.title ? `### ${block.title}\n\n` : ''
  const items = (block.items ?? [])
    .map((item: any) => `- [ ] ${item.text ?? ''}`)
    .join('\n')
  return `${title}${items}`
}

function renderStepList(block: any): string {
  const title = block.title ? `### ${block.title}\n\n` : ''
  const steps = (block.steps ?? [])
    .map((step: any, i: number) => {
      const role = step.roles?.length ? ` *(${step.roles.map((r: any) => r.title).join(', ')})*` : ''
      const duration = step.duration ? ` — ${step.duration}` : ''
      const desc = step.description
        ? `\n   ${portableTextToMarkdown(step.description).replace(/\n/g, '\n   ')}`
        : ''
      return `${i + 1}. **${step.title ?? ''}**${role}${duration}${desc}`
    })
    .join('\n')
  return `${title}${steps}`
}

function renderDiagramBlock(block: any): string {
  // code-input stores the code in .code.code
  const code = block.code?.code ?? block.code ?? ''
  const caption = block.caption ? `\n*${block.caption}*` : ''
  return `\`\`\`mermaid\n${code}\n\`\`\`${caption}`
}

function renderHotspotFigure(block: any): string {
  const caption = block.caption ?? block.alt ?? 'Figur'
  const imageUrl = block.imageUrl ?? ''
  const hotspots = (block.hotspots ?? []) as any[]
  const lines: string[] = [`![${caption}](${imageUrl})`]
  if (hotspots.length > 0) {
    lines.push('')
    hotspots.forEach((h: any, i: number) => {
      lines.push(`[^hs${i + 1}]: **${h.label ?? `Hotspot ${i + 1}`}** — ${h.description ?? ''}`)
    })
  }
  return lines.join('\n')
}

function renderConceptModel(block: any): string {
  const variant: string = block.variant ?? 'phases'
  const title = block.title ? `### ${block.title}\n\n` : ''
  const items: any[] = block.items ?? []

  if (variant === 'twoByTwo') {
    const lines = [`${title}**2×2 modell**\n`]
    lines.push(`| | **${block.xLabel ?? 'X'}** (lav) | **${block.xLabel ?? 'X'}** (høy) |`)
    lines.push('|---|---|---|')
    // Simple table: pair items row by row
    for (let i = 0; i < items.length; i += 2) {
      const a = items[i]
      const b = items[i + 1]
      lines.push(`| **${block.yLabel ?? 'Y'}** | ${a?.title ?? ''}: ${a?.description ?? ''} | ${b?.title ?? ''}: ${b?.description ?? ''} |`)
    }
    return lines.join('\n')
  }

  if (variant === 'comparison') {
    const headers = (block.columns ?? []).join(' | ')
    const sep = (block.columns ?? []).map(() => '---').join(' | ')
    const rows = items.map((item: any) =>
      (block.columns ?? []).map((col: string) => item[col] ?? '').join(' | ')
    )
    return `${title}| ${headers} |\n| ${sep} |\n${rows.map((r: string) => `| ${r} |`).join('\n')}`
  }

  // phases (default) + doubleDiamond
  const steps = items.map((item: any, i: number) => {
    const desc = item.description
      ? `\n   ${portableTextToMarkdown(item.description ?? []).replace(/\n/g, '\n   ')}`
      : ''
    return `${i + 1}. **${item.title ?? ''}**${desc}`
  }).join('\n')
  return `${title}${steps}`
}

function renderSkillEmbed(block: any): string {
  const skill = block.skill
  if (!skill) return ''
  const lines: string[] = [
    `### ⚡ AI Skill: ${skill.title}`,
    '',
    skill.summary ? `${skill.summary}\n` : '',
  ]
  if (skill.promptArtifact?.systemPrompt) {
    lines.push('**System Prompt**')
    lines.push('```')
    lines.push(skill.promptArtifact.systemPrompt)
    lines.push('```')
  }
  if (skill.promptArtifact?.userPromptTemplate) {
    lines.push('\n**User Prompt Template**')
    lines.push('```')
    lines.push(skill.promptArtifact.userPromptTemplate)
    lines.push('```')
  }
  if ((skill.promptArtifact?.variables ?? []).length > 0) {
    lines.push('\n**Variabler**')
    for (const v of skill.promptArtifact.variables) {
      lines.push(`- \`${v.name}\`: ${v.description ?? ''}${v.example ? ` (eks: *${v.example}*)` : ''}`)
    }
  }
  if ((skill.workflowArtifact?.steps ?? []).length > 0) {
    lines.push('\n**Steg**')
    skill.workflowArtifact.steps.forEach((s: any, i: number) => {
      lines.push(`${i + 1}. **${s.title}**${s.prompt ? `\n   ${s.prompt}` : ''}`)
    })
  }
  if ((skill.evaluationArtifact?.criteria ?? []).length > 0) {
    lines.push('\n**Evalueringskriterier**')
    for (const c of skill.evaluationArtifact.criteria) {
      lines.push(`- **${c.label}**: ${c.description ?? ''}`)
    }
  }
  return lines.join('\n')
}

function renderFigure(block: any): string {
  const url = block.imageUrl ?? block.asset?.url ?? block.asset?.asset?.url ?? ''
  const alt = block.alt ?? block.caption ?? ''
  const caption = block.caption ? `\n*${block.caption}*` : ''
  return `![${alt}](${url})${caption}`
}

function renderEmbed(block: any): string {
  const url = block.url ?? ''
  const title = block.title ? `[${block.title}](${url})` : url
  return `> 🔗 ${title}`
}

type TableRow = any[] | { cells?: any[] }

function normalizeTableRows(rows: TableRow[]): any[][] {
  return rows.map((row) => Array.isArray(row) ? row : row.cells ?? [])
}

function normalizeTableShape(rows: any[][]): any[][] {
  const columnCount = Math.max(0, ...rows.map((row) => row.length))
  if (columnCount === 0) return []
  return rows.map((row) => Array.from({ length: columnCount }, (_, i) => row[i] ?? ''))
}

function renderTable(block: any): string {
  const rows = normalizeTableShape(normalizeTableRows(block.rows ?? []))
  if (rows.length === 0) return ''
  const [header, ...body] = rows
  if (!header) return ''
  const cells = (row: any[]) => row.map((c) => (c?.text ?? c ?? '').toString().replace(/\|/g, '\\|')).join(' | ')
  const sep = header.map(() => '---').join(' | ')
  const bodyRows = body.map((r) => `| ${cells(r)} |`).join('\n')
  return `| ${cells(header)} |\n| ${sep} |\n${bodyRows}`
}

// ── List accumulation ──────────────────────────────────────────────────────────

interface ListItem {
  text: string
  level: number
  listItem: 'bullet' | 'number'
}

function renderListItems(items: ListItem[]): string {
  return items
    .map((item) => {
      const indent = '  '.repeat(Math.max(0, item.level - 1))
      const marker = item.listItem === 'number' ? '1.' : '-'
      return `${indent}${marker} ${item.text}`
    })
    .join('\n')
}

// ── Main export ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function portableTextToMarkdown(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''

  const output: string[] = []
  let listBuffer: ListItem[] = []

  function flushList() {
    if (listBuffer.length === 0) return
    output.push(renderListItems(listBuffer))
    listBuffer = []
  }

  for (const block of blocks) {
    const type: string = block._type ?? 'block'

    // Standard text block
    if (type === 'block') {
      const listItem: string | undefined = block.listItem
      if (listItem === 'bullet' || listItem === 'number') {
        const text = renderChildren(block.children ?? [], block.markDefs ?? [])
        listBuffer.push({ text, level: block.level ?? 1, listItem })
        continue
      }
      flushList()
      const rendered = renderTextBlock(block)
      if (rendered.trim()) output.push(rendered)
      continue
    }

    flushList()

    if (type === 'hb.codeBlock')      { output.push(renderCodeBlock(block));      continue }
    if (type === 'hb.callout')        { output.push(renderCallout(block));        continue }
    if (type === 'hb.decisionRecord') { output.push(renderDecisionRecord(block)); continue }
    if (type === 'hb.checklist')      { output.push(renderChecklist(block));      continue }
    if (type === 'hb.stepList')       { output.push(renderStepList(block));       continue }
    if (type === 'hb.diagramBlock')   { output.push(renderDiagramBlock(block));   continue }
    if (type === 'hb.hotspotFigure')  { output.push(renderHotspotFigure(block));  continue }
    if (type === 'hb.conceptModel')   { output.push(renderConceptModel(block));   continue }
    if (type === 'hb.skillEmbed')     { output.push(renderSkillEmbed(block));     continue }
    if (type === 'hb.figure' || type === 'hb.imageBlock' || type === 'image') { output.push(renderFigure(block)); continue }
    if (type === 'hb.embed')          { output.push(renderEmbed(block));          continue }
    if (type === 'hb.table' || type === 'table') { output.push(renderTable(block)); continue }
    if (type === 'hb.codeGroup') {
      // Render each tab's code block
      for (const tab of block.tabs ?? []) {
        const label = tab.label ? `<!-- ${tab.label} -->\n` : ''
        output.push(`${label}\`\`\`${tab.language ?? ''}\n${tab.code ?? ''}\n\`\`\``)
      }
      continue
    }
    // Unknown type — skip silently
  }

  flushList()

  // Join blocks with blank lines between them
  return output.filter(Boolean).join('\n\n')
}

// ── Article-level serialiser ───────────────────────────────────────────────────

interface ArticleFrontmatter {
  title: string
  slug: string
  section: string
  maturity: string
  lastVerifiedAt?: string | null
  expertises?: string[]
}

export function articleToMarkdown(meta: ArticleFrontmatter, body: any[]): string {
  const fm = [
    '---',
    `title: "${meta.title.replace(/"/g, '\\"')}"`,
    `slug: ${meta.slug}`,
    `section: ${meta.section}`,
    `maturity: ${meta.maturity}`,
    meta.lastVerifiedAt ? `lastVerifiedAt: ${meta.lastVerifiedAt}` : null,
    (meta.expertises ?? []).length > 0
      ? `expertises: [${meta.expertises!.map((e) => `"${e}"`).join(', ')}]`
      : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n')

  const content = portableTextToMarkdown(body)
  return `${fm}\n\n# ${meta.title}\n\n${content}\n`
}

// ── Guide-level serialiser ────────────────────────────────────────────────────

interface GuideFrontmatter {
  title: string
  slug: string
  maturity: string
  lastVerifiedAt?: string | null
  expertises?: string[]
  roles?: string[]
  isLivingDocument?: boolean
  phases?: { title: string; duration: string | null }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function guideToMarkdown(meta: GuideFrontmatter, body: any[]): string {
  const fm: (string | null)[] = [
    '---',
    `title: "${meta.title.replace(/"/g, '\\"')}"`,
    `slug: ${meta.slug}`,
    `type: guide`,
    `maturity: ${meta.maturity}`,
    meta.isLivingDocument ? `isLivingDocument: true` : null,
    meta.lastVerifiedAt ? `lastVerifiedAt: ${meta.lastVerifiedAt}` : null,
    (meta.expertises ?? []).length > 0
      ? `expertises: [${meta.expertises!.map((e) => `"${e}"`).join(', ')}]`
      : null,
    (meta.roles ?? []).length > 0
      ? `roles: [${meta.roles!.map((r) => `"${r}"`).join(', ')}]`
      : null,
    '---',
  ]

  const lines: string[] = [
    fm.filter(Boolean).join('\n'),
    '',
    `# ${meta.title}`,
  ]

  if (meta.isLivingDocument) {
    lines.push('\n> **Levende dokument.** Denne guiden oppdateres etter hvert som mønsteret modnes.')
  }

  if ((meta.phases ?? []).length > 0) {
    lines.push('\n## Faser\n')
    meta.phases!.forEach((p, i) => {
      const dur = p.duration ? ` *(${p.duration})*` : ''
      lines.push(`${i + 1}. **${p.title}**${dur}`)
    })
  }

  const content = portableTextToMarkdown(body)
  if (content) lines.push('\n' + content)

  return lines.join('\n') + '\n'
}
