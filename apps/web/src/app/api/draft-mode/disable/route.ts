import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<never> {
  const dm = await draftMode()
  dm.disable()

  const redirectTo = req.nextUrl.searchParams.get('redirect') ?? '/'
  redirect(redirectTo)
}
