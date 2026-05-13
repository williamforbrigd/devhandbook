import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Plain text export — raw prompt only, for pasting directly into AI tools
export async function GET(_req: NextRequest): Promise<NextResponse> {
  return new NextResponse('', { status: 501 })
}
