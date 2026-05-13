import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<never> {
  const secret = req.nextUrl.searchParams.get('secret')
  const previewSecret = process.env.SANITY_PREVIEW_SECRET

  // If a secret is configured, validate it. Skip validation in dev when secret is unset.
  if (previewSecret && secret !== previewSecret) {
    redirect('/') // silent redirect — avoids leaking whether a secret exists
  }

  const dm = await draftMode()
  dm.enable()

  const redirectTo = req.nextUrl.searchParams.get('redirect') ?? '/'
  redirect(redirectTo)
}
