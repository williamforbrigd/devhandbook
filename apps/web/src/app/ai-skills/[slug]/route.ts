import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// .md export — prompt + explanation
export async function GET(_req: NextRequest): Promise<NextResponse> {
  return new NextResponse('', { status: 501 })
}
