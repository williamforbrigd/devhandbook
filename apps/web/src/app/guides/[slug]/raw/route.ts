import { NextResponse } from 'next/server'
import { client } from '../../../../lib/sanity'
import { guideBySlugQuery } from '../../../../lib/queries'
import { guideToMarkdown } from '../../../../lib/portableTextToMarkdown'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const guide = await client.fetch(guideBySlugQuery, { slug })
  if (!guide) {
    return new NextResponse('Not found', { status: 404 })
  }

  const markdown = guideToMarkdown(
    {
      title: guide.title,
      slug: guide.slug,
      maturity: guide.maturity,
      lastVerifiedAt: guide.lastVerifiedAt ?? null,
      expertises: (guide.expertises ?? []).map((e: { title: string }) => e.title),
      roles: (guide.roles ?? []).map((r: { title: string }) => r.title),
      isLivingDocument: guide.isLivingDocument ?? false,
      phases: (guide.phases ?? []).map((p: { title: string; duration: string | null }) => ({
        title: p.title,
        duration: p.duration ?? null,
      })),
    },
    guide.body ?? [],
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
