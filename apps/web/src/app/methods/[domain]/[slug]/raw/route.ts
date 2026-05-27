import { NextResponse } from 'next/server'
import { client } from '../../../../../lib/sanity'
import { methodBySlugQuery } from '../../../../../lib/queries'
import { methodToMarkdown } from '../../../../../lib/portableTextToMarkdown'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ domain: string; slug: string }> },
) {
  const { domain, slug } = await params

  const method = await client.fetch(methodBySlugQuery, { domain, slug })
  if (!method) {
    return new NextResponse('Not found', { status: 404 })
  }

  const markdown = methodToMarkdown(
    {
      title: method.title,
      slug: method.slug,
      domain: method.domain.slug,
      methodType: method.type,
      expertises: (method.expertises ?? []).map((expertise: { title: string }) => expertise.title),
    },
    method.body ?? [],
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