import { NextResponse } from 'next/server'
import { client } from '../../../../lib/sanity'
import { aiSkillBySlugQuery } from '../../../../lib/queries'
import { aiSkillToMarkdown } from '../../../../lib/portableTextToMarkdown'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params

  const skill = await client.fetch(aiSkillBySlugQuery, { slug })
  if (!skill) {
    return new NextResponse('Not found', { status: 404 })
  }

  const markdown = aiSkillToMarkdown(skill)

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug}.md"`,
      'Cache-Control': 'no-store',
    },
  })
}
