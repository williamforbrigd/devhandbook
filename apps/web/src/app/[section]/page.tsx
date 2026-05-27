import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'
import { fetchSection, fetchSectionArticles, fetchSectionGuides } from '../../lib/queries'
import { SectionHub } from '../../components/guide/SectionHub'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params
  const s = await fetchSection(section)
  return { title: s?.title ?? section }
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>
  searchParams: Promise<{ tab?: string }>
}): Promise<React.JSX.Element> {
  const { section } = await params
  const { tab } = await searchParams
  const [sectionData, articles, guides] = await Promise.all([
    fetchSection(section),
    fetchSectionArticles(section),
    fetchSectionGuides(section),
  ])
  if (!sectionData) notFound()

  return (
    <SectionHub
      section={sectionData}
      articles={articles}
      guides={guides}
      defaultTab={tab === 'guides' ? 'guides' : 'articles'}
    />
  )
}

