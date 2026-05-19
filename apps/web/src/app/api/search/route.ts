import { NextResponse } from 'next/server'
import { searchHandbookContent } from '../../../lib/search/handbookSearch'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  try {
    const response = await searchHandbookContent(query, limit)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Handbook search failed', error)
    return NextResponse.json(
      { error: 'Search failed', query: query.trim(), results: [], total: 0 },
      { status: 500 },
    )
  }
}