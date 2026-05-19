import type { Metadata } from 'next'
import type React from 'react'
import { searchHandbookContent } from '../../lib/search/handbookSearch'
import { HandbookSearchPageContent } from '../../components/layout/search/HandbookSearchPageContent'

export const metadata: Metadata = { title: 'Søk' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<React.JSX.Element> {
  const params = await searchParams
  const query = params.q ?? ''
  const { results } = await searchHandbookContent(query, 30)

  return <HandbookSearchPageContent query={query.trim()} results={results} />
}