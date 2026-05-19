import type { TocItem } from '../components/layout/TableOfContents'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTocItems(body: any[]): TocItem[] {
  if (!Array.isArray(body)) return []
  const items: TocItem[] = []
  for (const block of body) {
    if (block._type !== 'block') continue
    if (block.style !== 'h2' && block.style !== 'h3') continue
    const text = (block.children ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => c.text ?? '')
      .join('')
    if (!text) continue
    items.push({ id: slugify(text), text, level: block.style === 'h2' ? 2 : 3 })
  }
  return items
}

// Estimate reading time from a portable text body.
// Counts words in all text-block children; uses 200 wpm (technical reading).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function estimateReadingMinutes(body: any[]): number {
  if (!Array.isArray(body)) return 1
  let words = 0
  for (const block of body) {
    if (block._type === 'block' && Array.isArray(block.children)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = block.children.map((c: any) => c.text ?? '').join(' ')
      words += text.trim().split(/\s+/).filter(Boolean).length
    }
  }
  return Math.max(1, Math.ceil(words / 200))
}
