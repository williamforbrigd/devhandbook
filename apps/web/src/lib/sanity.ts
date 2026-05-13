import { createClient } from 'next-sanity'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
export const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview',
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? 'http://localhost:3333',
  },
})

/** Server-side client that fetches drafts when draft mode is active */
export function getServerClient(previewToken?: string) {
  return client.withConfig({
    useCdn: false,
    token: previewToken ?? process.env.SANITY_API_READ_TOKEN,
    perspective: previewToken ? 'previewDrafts' : 'published',
    stega: { enabled: !!previewToken },
  })
}
