import { NextResponse } from 'next/server'
import { client } from '../../../../lib/sanity'
import { articleQuery } from '../../../../lib/queries'
import { articleToMarkdown } from '../../../../lib/portableTextToMarkdown'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ section: string; slug: string }> },
) {
  const { section, slug } = await params

  const article = await client.fetch(articleQuery, { section, slug })
  if (!article) {
    return new NextResponse('Not found', { status: 404 })
  }

  const markdown = articleToMarkdown(
    {
      title: article.title,
      slug: article.slug,
      section,
      maturity: article.maturity,
      lastVerifiedAt: article.lastVerifiedAt ?? null,
      expertises: (article.expertises ?? []).map((e: { title: string }) => e.title),
    },
    article.body ?? [],
  )

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug}.md"`,
      'Cache-Control': 'no-store',
    },
  })
}
