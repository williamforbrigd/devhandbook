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
