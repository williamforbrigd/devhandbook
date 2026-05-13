import React from 'react'
import { defineLive } from 'next-sanity'
import { client } from './sanity'

const defined = defineLive({
  client: client.withConfig({ useCdn: false }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  fetchOptions: {
    revalidate: 60,
  },
})

export const sanityFetch = defined.sanityFetch

// Wrapper avoids the @types/react 18/19 portability error on the inferred type
export function SanityLive(): React.JSX.Element {
  // @ts-expect-error — @sanity/next-loader bundles @types/react@18; web app uses @types/react@19
  return React.createElement(defined.SanityLive)
}
